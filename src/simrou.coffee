###*
* @preserve Simrou v1.4 - Released under the MIT License.
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
        
        @observingHash = false
        @observingForms = false
        
        # Create initial routes
        @addRoutes(initialRoutes) if initialRoutes?
    
    # Allows to register a new route with this simrou instance.
    addRoute: (pattern, actionHandler) ->
        route = if pattern instanceof Route then pattern else new Route(pattern)
        
        if actionHandler?
            if $.isFunction(actionHandler)
                route.any(actionHandler)
            else
                route.any(actionHandler)
        
        @routes[ route.getRegExp().toString() ] = route
    
    # Allows to bulk register routes.
    addRoutes: (routes) ->
        if $.isFunction(routes)
            list = routes.call(@)
        else if $.isArray(routes)
            list = []
            for route in routes
                list.push( @addRoute(route) )
        else
            list = {}
            for own pattern, route of routes
                list[pattern] = @addRoute(pattern, route)
        
        list
    
    # Unregisters the specified route (Route instance or pattern).
    removeRoute: (route) ->
        route = new Route(route) unless route instanceof Route
        
        name = route.getRegExp().toString()
        delete @routes[name] if name of @routes
        
    # Changes window.location.hash to the specified hash.
    navigate: (hash) ->
        previousHash = @getHash()
        location.hash = hash
        
        if not @observingHash or location.hash is previousHash
            @resolve(hash, 'get')
        
    # Resolves a hash. Method is optional, returns true if matching route found.
    resolve: (hash, method) ->
        # Strip unwanted characters from the hash
        cleanHash = String(hash).replace(@RegExpCache.trimHash, '$1')
        if cleanHash is ''
            if String(hash).indexOf('/') is -1
                return false
            else
                cleanHash = '/'
        
        # Iterate over all registerd routes
        for own name, route of @routes
            continue unless route instanceof Route
            
            # Route isn't a match? Continue with the next one
            args = route.match(cleanHash)
            continue unless args
            
            # Prepend the arguments array with the method
            args.unshift(method)
            
            # Trigger wildcard event
            $route = $(route)
            $route.trigger('simrou:any', args)
            
            # If a method is specified, trigger the specific event
            if method? and method isnt 'any'
                $route.trigger('simrou:' + method.toLowerCase(), args)
            
            return true
        
        false
    
    # Return the current value for window.location.hash without any
    # leading hash keys (does not remove leading slashes!).
    getHash: (url = location.hash) ->
        String(url).replace(@RegExpCache.extractHash, '$1')
    
    # Takes whatever window.location.hash currently is and tries
    # to resolve that hash.
    resolveHash: (event) =>
        url = event.originalEvent.newURL if @eventSupported
        hash = @getHash(url)
        @resolve(hash, 'get')
    
    # Can be bound to forms (onSubmit). Suppresses the submission of
    # any form, if a matching route for the form's action is found.
    handleFormSubmit: (event) =>
        $form = $(event.target)
        
        method = $form.attr('method') or $form.get(0).getAttribute('method')
        action = @getHash( $form.attr('action') )
        
        if @resolve(action, method)
            event.preventDefault()
        
        true
    
    # Starts the routing process - binds the Simrou instance to several
    # events and navigates to the specified initial hash, if window.
    # location.hash is empty.
    start: (initialHash, observeHash = true, observeForms = true) ->
        # Register event handler for the onHashChange event
        if observeHash
            $(window).on('hashchange', @resolveHash)
            @observingHash = true
        
        # Listen to form submissions
        if observeForms
            $('body').on('submit', 'form', @handleFormSubmit)
            @observingForms = true
        
        # Resolve the current or (if none) the initial hash
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
        # Stop observing hash changes
        $(window).off('hashchange', @resolveHash)
        @observingHash = false
        
        # Stop listening to form submissions
        $('body').off('submit', 'form', @handleFormSubmit)
        @observingForms = false


class Route
    
    # Cache some static regular expressions - thanks Backbone.js!
    RegExpCache:
        escapeRegExp: /[-[\]{}()+?.,\\^$|#\s]/g
        namedParam: /:\w+/g
        splatParam: /\*\w*/g
        firstParam: /(:\w+)|(\*\w*)/
    
    constructor: (@pattern = /^.+$/) ->
        if @pattern instanceof RegExp
            @expr = @pattern
        else
            # Do some escaping and replace the parameter placeholders
            # with the proper regular expression
            pattern = String(@pattern).replace(@RegExpCache.escapeRegExp, '\\$&')
            pattern = pattern.replace(@RegExpCache.namedParam, '([^\/]+)')
            pattern = pattern.replace(@RegExpCache.splatParam, '(.*?)')
            
            @expr = new RegExp('^' + pattern + '$')
    
    # Returns an array if this route matches the specified hash (false otherwise).
    match: (hash) ->
        matches = @expr.exec(hash)
        if $.isArray(matches) then matches.slice(1) else false
    
    # Assembles a concrete url out of this route.
    assemble: (values...) ->
        # Cannot assemble a route if it's based on a regular expression
        if @pattern instanceof RegExp
            throw 'Assembling routes that are based on a regular expression is not supported.'
        
        if values.length > 0 and $.isArray(values[0])
            values = values[0]
        
        url = String(@pattern)
        
        while @RegExpCache.firstParam.test(url)
            # Get the right replacement
            value = if values.length > 0 then values.shift() else ''
            
            if $.isFunction(value)
                value = value(@)
            
            # Replace (again) the first still present parameter
            url = url.replace(@RegExpCache.firstParam, String(value))
        
        url
    
    # Returns the regular expression that describes this route.
    getRegExp: ->
        @expr
    
    # Allows to attach an action handler to this route.
    # - method can be * (wildcard), get, post, put or delete
    # - action should be a function.
    # If only one argument is specified (a function), it is
    # registered as an action handler for all methods (*).
    attachAction: (action, method = 'any') ->
        $(@).on('simrou:' + method.toLowerCase(), action)
    
    # Allows to bulk attach action handlers.
    attachActions: (actions, method = 'any') ->
        # Homogenize argument
        if typeof actions isnt 'object'
            actions = new -> @[method] = actions
        
        # Attach the actions
        for own method, list of actions
            list = [list] unless $.isArray(list)
            @attachAction(action, method) for action in list
    
    # Works just like attachAction, but instead detaches the action
    # handler from the route.
    detachAction: (action, method = 'any') ->
        if typeof action is 'string'
            method = action
        
        eventName = 'simrou:' + method.toLowerCase()
        
        if $.isFunction(action)
            $(@).off(eventName, action)
        else
            $(@).off(eventName)
    
    shortcut = (method) ->
        (action) -> @attachAction(action, method)
    
    get: shortcut 'get'
    post: shortcut 'post'
    put: shortcut 'put'
    delete: shortcut 'delete'
    any: shortcut 'any'


# Export Simrou to the global namespace
window.Simrou = Simrou