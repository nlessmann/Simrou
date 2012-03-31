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
    
    /* Assembles a concrete url out of this route. */
    var assemble = function(values) {
        
        // Can't assemble route, if it is based on a regular expression
        if (pattern instanceof RegExp) {
            throw 'Assembling routes that are based on a regular expression is not supported.';
        }
    
        // Are the values provided in array form?
        if (!$.isArray(values)) {
            values = Array.prototype.slice.call(arguments);
        }
        
        var str = pattern,
            i = 0, value;
        
        while (Route.firstParam.test(str)) {
            // Get the right replacement
            if (!values[i] && values[i] !== 0) {
                value = '';
            } else if ($.isFunction(values[i])) {
                value = values[i].call(self);
            } else {
                value = String(values[i]);
            }
            
            str = str.replace(Route.firstParam, value);
            i++;
        }
        
        return str;
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
    self.assemble = assemble;
    
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
            pattern = String(pattern);
            
            expr = new RegExp('^' + pattern.replace(Route.escapeRegExp, '\\$&')
                                           .replace(Route.namedParam, '([^\/]+)')
                                           .replace(Route.splatParam, '(.*?)') + '$');
        } else {
            expr = /^.+$/;
        }
    }
};

// Cache some static regular expressions - thanks Backbone.js!
Route.escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g,
Route.namedParam   = /:\w+/g,
Route.splatParam   = /\*\w*/g,
Route.firstParam   = /(:\w+)|(\*\w*)/;
