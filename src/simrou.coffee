###*
* @preserve Simrou v1.5.4 - Released under the MIT License.
* Copyright (c) 2012 büro für ideen, www.buero-fuer-ideen.de
###

class Simrou
    # Cache regular expressions
    RegExpCache:
        extractHash: /^[^#]*(#.*)$/
        trimHash: /^#*(.*?)\/*$/
    
    # Does the user's browser natively support the onHashChange event? 
    eventSupported: do ->
        docMode = window.document.documentMode
        'onhashchange' of window and (not docMode? or docMode > 7)
    
    constructor: (initialRoutes) ->
        # Initialize class members
        @routes = {}
        
        @listening = false
        @observeHash = false
        @observeForms = false
        
        # Create initial routes
        @addRoutes(initialRoutes) if initialRoutes?
        @initialize() if @initialize?
    
    # Allows to register a new route with this simrou instance.
    addRoute: (pattern, caseSensitive = true) ->
        route = if pattern instanceof Route then pattern else new Route(pattern, caseSensitive)
        @routes[ route.toString() ] = route
    
    # Allows to bulk register routes.
    addRoutes: (routes, caseSensitive = true) ->
        if jQuery.isFunction(routes)
            list = routes.call(@, caseSensitive)
        else if jQuery.isArray(routes)
            list = []
            for route in routes
                list.push( @addRoutes(route, caseSensitive) )
        else if jQuery.isPlainObject(routes)
            list = {}
            for own pattern, actions of routes
                route = @addRoute(pattern, caseSensitive)
                route.attachActions(actions)
                list[pattern] = route
        else
            list = @addRoute(routes, caseSensitive)
        
        list
    
    # Unregisters the specified route (Route instance or pattern).
    removeRoute: (route) ->
        unless route instanceof Route
            route = new Route(route)
        
        name = route.toString()
        delete @routes[name] if name of @routes
        
    # Changes window.location.hash to the specified hash.
    navigate: (hash) ->
        previousHash = @getHash()
        location.hash = hash
        
        if not @observeHash or location.hash is previousHash
            @resolve(hash, 'get')
        
    # Resolves a hash. Method is optional, returns true if matching route found.
    resolve: (hash, method, data) ->
        # Strip unwanted characters from the hash
        cleanHash = String(hash).replace(@RegExpCache.trimHash, '$1')
        if cleanHash is ''
            if String(hash).indexOf('/') is -1
                return false
            else
                cleanHash = '/'
        
        # Iterate over all registerd routes
        for own name, route of @routes
            unless route instanceof Route
                continue
            
            # Route isn't a match? Continue with the next one
            params = route.match(cleanHash)
            unless params
                continue

            # Prepend the arguments array with the method
            if method in ['post', 'put']
                args = [params, method, data]
            else
                args = [params, method]
            
            # Trigger wildcard event
            $route = jQuery(route)
            $route.trigger('simrou:any', args)
            
            # If a method is specified, trigger the specific event
            if method? and method isnt 'any'
                $route.trigger('simrou:' + method.toLowerCase(), args)
            
            return true
        
        return false
    
    # Return the current value for window.location.hash without any
    # leading hash keys (does not remove leading slashes!).
    getHash: (url = location.hash) ->
        String(url).replace(@RegExpCache.extractHash, '$1')
    
    # Takes whatever window.location.hash currently is and tries
    # to resolve that hash.
    resolveHash: (event) =>
        if @observeHash
            url = event.originalEvent.newURL if @eventSupported
            hash = @getHash(url)
            @resolve(hash, 'get')
    
    # Can be bound to forms (onSubmit). Suppresses the submission of
    # any form, if a matching route for the form's action is found.
    handleFormSubmit: (event) =>
        if @observeForms
            $form = jQuery(event.target)
            
            method = $form.attr('method') or $form.get(0).getAttribute('method')
            action = @getHash( $form.attr('action') )
            
            if @resolve(action, method)
                event.preventDefault()
        
        return true
    
    # Registers event handlers for onHashChange and onSubmit events
    listen: ->
        unless @listening
            jQuery(window).on('hashchange.simrou', @resolveHash)
            jQuery => jQuery('body').on('submit.simrou', 'form', @handleFormSubmit)
            @listening = true
    
    # Starts the routing process - binds the Simrou instance to several
    # events and navigates to the specified initial hash, if window.
    # location.hash is empty.
    start: (initialHash, @observeHash = true, @observeForms = true) ->
        # Required to listen to some events?
        @listen() if @observeHash or @observeForms
        
        # Resolve the current or (if none is set) the initial hash
        hash = @getHash()
        if hash isnt ''
            @resolve(hash, 'get')
        else if initialHash?
            if window.history? and window.history.replaceState?
                # Fixes a safari bug where the initial hash is not pushed to the history
                # when altering location.hash while the page is still loading.
                window.history.replaceState({}, document.title, '#' + initialHash.replace(/^#+/, ''))
                @resolve(initialHash, 'get')
            else
                @navigate(initialHash)            
    
    # Stops the routing process - all event handlers registered by this
    # Simrou instance get unbind.
    stop: ->
        # Stop observing hash changes and form submissions
        @observeHash = false
        @observeForms = false


class Route
    
    # Cache some static regular expressions - thanks Backbone.js!
    RegExpCache:
        escapeRegExp: /[-[\]{}()+?.,\\^$|#\s]/g
        namedParam: /:(\w+)/g
        splatParam: /\*(\w+)/g
        firstParam: /(:\w+)|(\*\w+)/
        allParams: /(:|\*)\w+/g
    
    constructor: (@pattern, @caseSensitive = true) ->
        # Ensure that we're dealing with a string
        pattern = String(@pattern)
        
        # Extract names of the parameters and splats
        names = pattern.match(@RegExpCache.allParams)
        
        if names?
            @params = (name.substr(1) for name in names)
        else
            @params = []
            
        # Do some escaping and replace the parameter placeholders
        # with the proper regular expression
        pattern = pattern.replace(@RegExpCache.escapeRegExp, '\\$&')
        pattern = pattern.replace(@RegExpCache.namedParam, '([^\/]+)')
        pattern = pattern.replace(@RegExpCache.splatParam, '(.+?)')
        
        flags = if caseSensitive then '' else 'i'
        @expr = new RegExp('^' + pattern + '$', flags)
    
    # Returns an array if this route matches the specified hash (false otherwise).
    match: (hash) ->
        matches = @expr.exec(hash)
        
        if jQuery.isArray(matches)
            result = {}
            result[name] = matches[index + 1] for name, index in @params
        else
            result = false
        
        result
    
    # Assembles a concrete url out of this route.
    assemble: (values...) ->
        if values.length > 0
            if jQuery.isArray(values[0])
                values = values[0]
            else if jQuery.isPlainObject(values[0])
                # Sort values in the way the appear in @params
                values = ((if name of values[0] then values[0][name] else '') for name in @params)
                
        url = String(@pattern)
        
        while @RegExpCache.firstParam.test(url)
            # Get the right replacement
            value = if values.length > 0 then values.shift() else ''
            
            if jQuery.isFunction(value)
                value = value(@)
            
            # Replace (again) the first still present parameter
            url = url.replace(@RegExpCache.firstParam, String(value))
        
        url
    
    # Returns a string representation of this route.
    toString: ->
        String(@pattern)
    
    # Allows to attach an action handler to this route.
    # - method can be * (wildcard), get, post, put or delete
    # - action should be a function.
    # If only one argument is specified (a function), it is
    # registered as an action handler for all methods (*).
    attachAction: (action, method = 'any') ->
        jQuery(@).on('simrou:' + method.toLowerCase(), action)
        return @
    
    # Allows to bulk attach action handlers.
    attachActions: (actions, method = 'any') ->
        # Homogenize argument
        unless jQuery.isPlainObject(actions)
            [actions, tmp] = [{}, actions]
            actions[method] = tmp
        
        # Attach the actions
        for own method, list of actions
            list = [list] unless jQuery.isArray(list)
            @attachAction(action, method) for action in list
        
        return @
    
    # Works just like attachAction, but instead detaches the action
    # handler from the route.
    detachAction: (action, method = 'any') ->
        # Method only is also valid!
        if typeof action is 'string'
            method = action
        
        eventName = 'simrou:' + method.toLowerCase()
        
        if jQuery.isFunction(action)
            jQuery(@).off(eventName, action)
        else
            jQuery(@).off(eventName)
        
        return @
    
    shortcut = (method) ->
        (action) -> @attachAction(action, method)
    
    get: shortcut('get')
    post: shortcut('post')
    put: shortcut('put')
    delete: shortcut('delete')
    any: shortcut('any')
    

# Export Simrou to the global namespace
Simrou.Route = Route
window.Simrou = jQuery.Simrou = Simrou