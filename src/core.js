/**
 * Simrou allows to register routes and resolve hashes in order
 * to find and invoke a matching route.
 */
Simrou = function(initialRoutes) {
    // Prevent direct calls to this function
    if ( !(this instanceof Simrou) ) {
        return new Simrou(initialRoutes);
    }
    
    var self = this,
        routes = {},
        observingHash = false,
        observingForms = false;
    
    /* Allows to register a new route with this simrou instance. */
    var addRoute = function(pattern, actionHandler) {
        var route = (pattern instanceof Route) ? pattern : new Route(pattern);
        
        if (actionHandler) {
            if ($.isFunction(actionHandler)) {
                route.attachAction(actionHandler);
            } else {
                route.attachActions(actionHandler);
            }
        }
        
        routes[ route.getRegExp().toString() ] = route;
        return route;
    };
    
    /* Allows to bulk register routes. */
    var addRoutes = function(routes) {
        var list;
        
        if ($.isArray(routes)) {
            list = [];
            
            for (var i = 0; i < routes.length; i++) {
                list.push( addRoute(routes[i]) );
            }
        } else {
            list = {};
            
            $.each(function(pattern, route) {
                list[pattern] = addRoute(pattern, route);
            });
        }
        
        return list;
    };
    
    /* Unregisters the specified route (Route instance or pattern). */
    var removeRoute = function(route) {
        if ( !(route instanceof Route) ) {
            route = new Route(route);
        }
        
        var name = route.getRegExp().toString();
        
        if (routes[name]) {
            delete routes[name];
        }
        
        return self;
    };
    
    /* Changes window.location.hash to the specified hash. */
    var navigate = function(hash) {
        var isChange = (loc.hash != hash);
        loc.hash = hash;
        
        if (!observingHash || !isChange) {
            resolve(hash, 'get');
        }
        
        return self;
    };
    
    /* Resolves a hash.
     * - method is optional.
     * - Returns true, if a match is found. */
    var resolve = function(hash, method) {
        var route, $route,
            name, args;
        
        if (!hash) {
            return false;
        }
        
        // Iterate over all registered routes..
        for (var name in routes) {
            route = routes[name];
            if ( !(route instanceof Route) ) {
                continue;
            }
            
            // Route isn't a match? Continue with the next one.
            args = route.match(hash);
            if (args === false) {
                continue;
            }
            
            // Prepend the method to the arguments array
            args.unshift(method);
            
            // Trigger wildcard event
            $route = $(route);
            $route.trigger('simrou:*', args);
            
            // If a method is specified, trigger the corresponding event
            if (method) {
                $route.trigger('simrou:' + method.toLowerCase(), args);
            }
            
            return true;
        }
        
        return false;
    };
    
    /* Return the current value for window.location.hash without any
     * leading hash keys (does not remove leading slashes!). */
    var getHash = function(url) {
        return (url || loc.hash).replace(/^[^#]*#+(.*)$/, '$1');
    };
    
    /* Takes whatever window.location.hash currently is and tries
     * to resolves that hash. */
    var resolveHash = function(event) {
        var hash = getHash(event.originalEvent.newURL);
        resolve(hash, 'get');
    };
    
    /* Can be bound to forms (onSubmit). Suppresses the submission of
     * any form, if a matching route for the form's action is found. */
    var handleFormSubmit = function(event) {
        var $form = $(this),
            method = String( $form.attr('method') ) || 'get',
            action = $form.attr('action');
        
        if (resolve(action, method)) {
            event.preventDefault();
        }
    };
    
    /* Starts the routing process - binds the Simrou instance to several
     * events and navigates to the specified initial hash, if window.
     * location.hash is empty.
     * - initialHash is optional
     * - If observeHash is false, the event handler for onHashChange is
     *   NOT registered. Useful if you want to use any other plugin/method
     *   to handle/observe hash changes.
     * - The same applies to the "observeForms" parameter. */
    var start = function(initialHash, observeHash, observeForms) {
        
        // Register event handler for the onHashChange event
        if (typeof observeHash == 'undefined' || observeHash) {
            $(window).on('hashchange', resolveHash);
            observingHash = true;
        }
        
        // Listen to form submissions...
        if (typeof observeForms == 'undefined' || observeForms) {
            $('body').on('submit', 'form', handleFormSubmit);
            observingForms = true;
        }
        
        // Resolve the current / initial hash.
        var hash = getHash();
        if (hash == '') {
            if (initialHash) {
                navigate(initialHash);
            }
        } else {
            resolve(hash, 'get');
        }
        
        return self;
    };
    
    /* Stopps the routing process - all event handlers registered by this
     * Simrou instance get unbind. */
    var stop = function() {
    
        // Stop observing hash changes
        $(window).off('hashchange', resolveHash);
        observingHash = false;
        
        // Stop listening to form submission
        $('body').off('submit', 'form', handleFormSubmit);
        observingForms = false;
        
        return self;
    };
    
    // Exports
    self.addRoute = addRoute;
    self.addRoutes = addRoutes;
    self.removeRoute = removeRoute;
    self.start = start;
    self.stop = stop;
    self.navigate = navigate;
    self.resolve = resolve;
    
    // Initialization
    if (initialRoutes) {
        addRoutes(initialRoutes);
    }
    
    return self;
};
