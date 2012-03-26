/**
 * @preserve Simrou - Simple javascript routing framework
 * Copyright (c) 2012 büro für ideen, www.buero-fuer-ideen.de
 *//*
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

;(function($, window, undefined) {

    var version = '1.1.2';
    
    var Simrou, Route;
    
    // Cache some static regular expressions - thanks Backbone.js!
    var escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g,
        namedParam    = /:\w+/g,
        splatParam    = /\*\w*/g;
    
    /**
     * Represents a single route and allows to attach (and detach)
     * action handlers to that route. If 'pattern' is an empty string
     * or evaluates to false, the new route becomes a wildcard route.
     */
    Route = function(pattern) {
        var self = this,
            expr;
        
        /* Returns true if this route matches the specified hash. */
        var match = function(hash) {
            var matches = expr.exec(hash);
            
            if (!$.isArray(matches)) {
                return false;
            }
            
            return matches.slice(1);
        };
        
        /* Returns the regular expression that describes this route. */
        var getRegExp = function() {
            return expr;
        };
        
        /* Allows to attach an action handler to this route.
         * - method can be * (wildcard), get, post, put or delete
         * - action should be a function.
         * If only one argument is specified (a function), it is
         * registered as an action handler for all methods (*). */
        var attachAction = function(method, action) {
            if (!action && $.isFunction(method)) {
                action = method;
                method = '*';
            }
            
            $(self).on('simrou:' + method.toLowerCase(), action);
            return self;
        };
        
        /* Allows to bulk attach action handlers. */
        var attachActions = function(method, actions) {
            
            // Homogenize the arguments...
            if ($.isArray(method)) {
                actions = { '*': method };
            } else if ($.isPlainObject(method)) {
                actions = method;
            } else {
                var tmp = {};
                tmp[method] = actions;
                actions = tmp;
            }
            
            for (method in actions) {
                var list = actions[method];
                if (!$.isArray(list)) {
                    list = [list];
                }
                
                for (var i = 0; i < list.length; i++) {
                    attachAction(method, list[i]);
                }
            }
            
            return self;
        };
        
        /* Works just like attachAction, but instead detaches the action
         * handler from the route. */
        var detachAction = function(method, action) {
            if (!action && $.isFunction(method)) {
                action = method;
                method = '*';
            }
            
            $(self).off('simrou:' + method.toLowerCase(), ($.isFunction(action) ? action : undefined));
            return self;
        };
        
        var shortcut = function(method) {
            return function(action) {
                return attachAction(method, action);
            };
        };
        
        // Exports
        self.match = match;
        self.getRegExp = getRegExp;
        self.attachAction = attachAction;
        self.attachActions = attachActions;
        self.detachAction = detachAction;
        
        self.get = shortcut('get');
        self.post = shortcut('post');
        self.put = shortcut('put');
        self['delete'] = self.del = shortcut('delete');
        
        // Initialization
        if (pattern instanceof RegExp) {
            expr = pattern;
        } else {
            if (pattern) {
                // Do some escaping and replace the parameter placeholder
                // with the proper regular expression:
                pattern = String(pattern).replace(escapeRegExp, '\\$&')
                                         .replace(namedParam, '([^\/]+)')
                                         .replace(splatParam, '(.*?)');
                
                expr = new RegExp('^' + pattern + '$');
            } else {
                expr = /^.+$/;
            }
        }
    };
    
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
            loc = window.location,
            routes = {},
            observingHash = false;
        
        /* Allows to register a new route with this simrou instance. */
        var registerRoute = function(pattern, actionHandler) {
            var route = (pattern instanceof Route) ? pattern : new Route(pattern);
            
            if (actionHandler) {
                if ($.isFunction(actionHandler)) {
                    route.attachAction(actionHandler);
                } else {
                    route.attachActions(actionHandler);
                }
            }
            
            routes[ String(route.getRegExp()) ] = route;
            return route;
        };
        
        /* Allows to bulk register routes. */
        var registerRoutes = function(routes) {
            var list;
            
            if ($.isArray(routes)) {
                list = [];
                
                for (var i = 0; i < routes.length; i++) {
                    list.push( registerRoute(routes[i]) );
                }
            } else {
                list = {};
                
                for (var pattern in routes) {
                    list[pattern] = registerRoute(pattern, routes[pattern]);
                }
            }
            
            return list;
        };
        
        /* Unregisters the specified route (Route instance or pattern). */
        var removeRoute = function(route) {
            if ( !(route instanceof Route) ) {
                route = new Route(route);
            }
            
            var name = String(route.getRegExp());
            
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
            var match = false,
                route, $route,
                name, args;
            
            if (!hash) {
                return false;
            }
            
            // Iterate over all registered routes..
            for (var name in routes) {
                route = routes[name];
                args = route.match(hash);
                
                // Route isn't a match? Continue with the next one.
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
                
                match = true;
            }
            
            return match;
        };
        
        /* Return the current value for window.location.hash without any
         * leading hash keys (does not remove leading slashes!). */
        var getHash = function() {
            return loc.hash.replace(/^#*(.*)$/, '$1');
        };
        
        /* Takes whatever window.location.hash currently is and tries
         * to resolves that hash. */
        var resolveHash = function() {
            resolve(getHash(), 'get');
        };
        
        /* Can be bound to forms (onSubmit). Suppresses the submission of
         * any form, if a matching route for the form's action is found. */
        var handleFormSubmit = function() {
            var $form = $(this),
                method = String( $form.attr('method') ) || 'get',
                action = $form.attr('action');
            
            return !( resolve(action, method) );
        };
        
        /* Starts the routing process - binds the Simrou instance to several
         * events and navigates to the specified initial hash, if window.
         * location.hash is empty.
         * - initialHash is optional
         * - If dontObserverHash evaluates to "true", the event handler
         *   for onHashChange is NOT registered. Useful if you want to
         *   use any other plugin/method to handle/observe hash changes. */
        var start = function(initialHash, dontObserveHash) {
        
            // Register event handler for the onHashChange event
            if (!dontObserveHash) {
                $(window).on('hashchange', resolveHash);
                observingHash = true;
            }
            
            // Listen to form submissions...
            $('body').on('submit', 'form', handleFormSubmit);
            
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
            
            return self;
        };
        
        // Exports
        self.version = version;
        self.registerRoute = registerRoute;
        self.registerRoutes = registerRoutes;
        self.removeRoute = removeRoute;
        self.start = start;
        self.stop = stop;
        self.navigate = navigate;
        self.resolve = resolve;
        
        // Initialization
        if (initialRoutes) {
            registerRoutes(initialRoutes);
        }
        
        return self;
    };
    
    // Export version as a static property
    Simrou.version = version;
    
    // Global exports
    window.Simrou = Simrou;
    
})(jQuery, window);