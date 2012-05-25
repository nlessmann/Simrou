
/**
* @preserve Simrou v1.3.0 - Released under the MIT License.
* Copyright (c) 2012 büro für ideen, www.buero-fuer-ideen.de
*/

(function() {
  var Route, Simrou,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __slice = Array.prototype.slice;

  Simrou = (function() {

    Simrou.prototype.eventSupported = (function() {
      var docMode;
      docMode = window.document.documentMode;
      return 'onhashchange' in window && (!(docMode != null) || docMode > 7);
    })();

    function Simrou(initialRoutes) {
      this.handleFormSubmit = __bind(this.handleFormSubmit, this);
      this.resolveHash = __bind(this.resolveHash, this);      this.routes = {};
      this.observingHash = false;
      this.observingForms = false;
      if (initialRoutes != null) this.addRoutes(initialRoutes);
    }

    Simrou.prototype.addRoute = function(pattern, actionHandler) {
      var route;
      route = pattern instanceof Route ? pattern : new Route(pattern);
      if (actionHandler != null) {
        if ($.isFunction(actionHandler)) {
          route.attachAction(actionHandler);
        } else {
          route.attachActions(actionHandler);
        }
      }
      return this.routes[route.getRegExp().toString()] = route;
    };

    Simrou.prototype.addRoutes = function(routes) {
      var list, pattern, route, _i, _len;
      if ($.isArray(routes)) {
        list = [];
        for (_i = 0, _len = routes.length; _i < _len; _i++) {
          route = routes[_i];
          list.push(this.addRoute(route));
        }
      } else {
        list = {};
        for (pattern in routes) {
          if (!__hasProp.call(routes, pattern)) continue;
          route = routes[pattern];
          list[pattern] = this.addRoute(pattern, route);
        }
      }
      return list;
    };

    Simrou.prototype.removeRoute = function(route) {
      var name;
      if (!(route instanceof Route)) route = new Route(route);
      name = route.getRegExp().toString();
      if (name in this.routes) return delete this.routes[name];
    };

    Simrou.prototype.navigate = function(hash) {
      var isChange;
      isChange = location.hash !== hash;
      location.hash = hash;
      if (!this.observingHash || !isChange) return this.resolve(hash, 'get');
    };

    Simrou.prototype.resolve = function(hash, method) {
      var $route, args, name, route, _ref;
      if (hash == null) return false;
      _ref = this.routes;
      for (name in _ref) {
        if (!__hasProp.call(_ref, name)) continue;
        route = _ref[name];
        if (!(route instanceof Route)) continue;
        args = route.match(hash);
        if (!args) continue;
        args.unshift(method);
        $route = $(route);
        $route.trigger('simrou:*', args);
        if (method != null) $route.trigger('simrou:' + method.toLowerCase(), args);
        return true;
      }
      return false;
    };

    Simrou.prototype.getHash = function(url) {
      if (url == null) url = location.hash;
      return url.replace(/^[^#]*#+(.*)$/, '$1');
    };

    Simrou.prototype.resolveHash = function(event) {
      var hash, url;
      if (this.eventSupported) url = event.originalEvent.newURL;
      hash = this.getHash(url);
      return this.resolve(hash, 'get');
    };

    Simrou.prototype.handleFormSubmit = function(event) {
      var $form, action, method;
      $form = $(event.target);
      method = String($form.attr('method')) || 'get';
      action = $form.attr('action');
      if (this.resolve(action, method)) event.preventDefault();
      return true;
    };

    Simrou.prototype.start = function(initialHash, observeHash, observeForms) {
      var hash,
        _this = this;
      if (observeHash == null) observeHash = true;
      if (observeForms == null) observeForms = true;
      if (observeHash) {
        $(window).on('hashchange', this.resolveHash);
        this.observingHash = true;
      }
      if (observeForms) {
        $('body').on('submit', 'form', this.handleFormSubmit);
        this.observingForms = true;
      }
      hash = this.getHash();
      if (hash !== '') {
        return this.resolve(hash, 'get');
      } else if (initialHash != null) {
        if ((window.history != null) && (window.history.replaceState != null)) {
          window.history.replaceState({}, document.title, '#' + initialHash.replace(/^#+/, ''));
          return this.resolve(initialHash, 'get');
        } else {
          return $(function() {
            return _this.navigate(initialHash);
          });
        }
      }
    };

    Simrou.prototype.stop = function() {
      $(window).off('hashchange', this.resolveHash);
      this.observingHash = false;
      $('body').off('submit', 'form', this.handleFormSubmit);
      return this.observingForms = false;
    };

    return Simrou;

  })();

  Route = (function() {
    var shortcut;

    Route.prototype.escapeRegExp = /[-[\]{}()+?.,\\^$|#\s]/g;

    Route.prototype.namedParam = /:\w+/g;

    Route.prototype.splatParam = /\*\w*/g;

    Route.prototype.firstParam = /(:\w+)|(\*\w*)/;

    function Route(pattern) {
      this.pattern = pattern;
      if (pattern instanceof RegExp) {
        this.expr = pattern;
      } else {
        if (pattern != null) {
          pattern = String(pattern);
          pattern = pattern.replace(this.escapeRegExp, '\\$&');
          pattern = pattern.replace(this.namedParam, '([^\/]+)');
          pattern = pattern.replace(this.splatParam, '(.*?)');
          this.expr = new RegExp('^' + pattern + '$');
        } else {
          this.expr = /^.+$/;
        }
      }
    }

    Route.prototype.match = function(hash) {
      var matches;
      matches = this.expr.exec(hash);
      if (!$.isArray(matches)) return false;
      return matches.slice(1);
    };

    Route.prototype.getRegExp = function() {
      return this.expr;
    };

    Route.prototype.attachAction = function(method, action) {
      if (!(action != null) && $.isFunction(method)) {
        action = method;
        method = '*';
      }
      return $(this).on('simrou:' + method.toLowerCase(), action);
    };

    Route.prototype.attachActions = function(method, actions) {
      var action, list, tmp, _results;
      if ($.isArray(method)) {
        actions = {
          '*': method
        };
      } else if ($.isPlainObject(method)) {
        actions = method;
      } else {
        tmp = {};
        tmp[method] = actions;
        actions = tmp;
      }
      _results = [];
      for (method in actions) {
        if (!__hasProp.call(actions, method)) continue;
        list = actions[method];
        if (!$.isArray(list)) list = [list];
        _results.push((function() {
          var _i, _len, _results2;
          _results2 = [];
          for (_i = 0, _len = list.length; _i < _len; _i++) {
            action = list[_i];
            _results2.push(this.attachAction(method, action));
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    Route.prototype.detachAction = function(method, action) {
      var eventName;
      if (!(action != null) && $.isFunction(method)) {
        action = method;
        method = '*';
      }
      eventName = 'simrou:' + method.toLowerCase();
      if ($.isFunction(action)) {
        return $(this).off(eventName, action);
      } else {
        return $(this).off(eventName);
      }
    };

    Route.prototype.assemble = function() {
      var i, str, value, values;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (this.pattern instanceof RegExp) {
        throw 'Assembling routes that are based on a regular expression is not supported.';
      }
      if (values.length > 0 && $.isArray(values[0])) values = values[0];
      str = this.pattern;
      i = 0;
      while (this.firstParam.test(str)) {
        if (values[i] != null) {
          value = $.isFunction(values[i]) ? values[i]() : String(values[i]);
        } else {
          value = '';
        }
        str = str.replace(this.firstParam, value);
        ++i;
      }
      return str;
    };

    shortcut = function(method) {
      return function(action) {
        return this.attachAction(method, action);
      };
    };

    Route.prototype.get = shortcut('get');

    Route.prototype.post = shortcut('post');

    Route.prototype.put = shortcut('put');

    Route.prototype["delete"] = shortcut('delete');

    return Route;

  })();

  window.Simrou = Simrou;

}).call(this);
