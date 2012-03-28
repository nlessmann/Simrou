module('Core');

test('Instantiation', function() {
    expect(5);
    
    // Check whether Simrou is available
    ok(Simrou, 'Presence');
    equal(typeof Simrou, 'function', 'Simrou is a function.');
    
    // Test the creation of a new instance
    var s = new Simrou();
    ok(s instanceof Simrou, 'Using the new operator on Simrou returns a fresh instance.');
    
    s = Simrou();
    ok(s instanceof Simrou, 'Invoking Simrou() without the new operator returns a fresh instance as well.');
    
    // Check if the information about the current version is present
    equal(typeof Simrou.version, 'string', 'Simrou.version is a string.');
});

test('Registration and removal of routes', function() {
    expect(19);
    
    var s = new Simrou();
    
    // Register a route without arguments
    var r = s.addRoute();
    equal(typeof r, 'object', 'addRoute() returns an object.');
    
    // Register route and attach fallback action handler right away
    s = new Simrou();
    r = s.addRoute('r1', function() {
        ok(true, 'A single action handler can be attached right away while registering the route.');
    });
    s.resolve('r1');
    
    // Register route and attach multiple action handlers right away
    r = s.addRoute('r2', {
        get: function() {
            ok(true, 'Attaching action handler at registration works. (1/2)');
        },
        post: function() {
            ok(true, 'Attaching action handler at registration works. (2/2)');
        }
    });
    s.resolve('r2', 'get');
    s.resolve('r2', 'post');
    
    // Remove route via route object
    r = s.addRoute('r3', function() {
        ok(false, 'A route object can be removed (via the route object).');
    });
    
    s.removeRoute(r);
    s.resolve('r3');
    
    // Remove route via route pattern
    r = s.addRoute('r4', function() {
        ok(false, 'A route object can be removed (via the route pattern).');
    });
    
    s.removeRoute('r4');
    s.resolve('r4');
    
    // Reattach a route
    r = s.addRoute('r5', function() {
        ok(true, 'A route object can be reattached.');
    });
    s.removeRoute(r);
    s.addRoute(r);
    s.resolve('r5');
    
    // Register multiple routes (via array)
    r = s.addRoutes(['r6.1', 'r6.2']);
    ok($.isArray(r), 'addRoutes(array) returns an array.');
    equal(typeof r[0], 'object', '...that contains objects (1/2)');
    equal(typeof r[1], 'object', '...that contains objects (2/2)');
    ok(r[0].attachAction, '...of type Simrou.Route (1/2)');
    ok(r[1].attachAction, '...of type Simrou.Route (2/2)');
    
    // Register multiple routes (via object)
    r = s.addRoutes({
        'r7.1': function() {
            ok(true, 'addRoutes(object) can attach action handlers. (1/2)');
        },
        'r7.2': function() {
            ok(true, 'addRoutes(object) can attach action handlers. (2/2)');
        }
    });
    
    ok($.isPlainObject(r), 'addRoutes(object) returns an object.');
    ok(r['r7.1'], '...that contains values with the route patterns as keys (1/2)');
    ok(r['r7.2'], '...that contains values with the route patterns as keys (2/2)');
    equal(typeof r['r7.1'], 'object', '...that are objects (1/2)');
    equal(typeof r['r7.2'], 'object', '...that are objects (2/2)');
    ok(r['r7.1'].attachAction, '...of type Simrou.Route (1/2)');
    ok(r['r7.2'].attachAction, '...of type Simrou.Route (2/2)');
    
    s.resolve('r7.1');
    s.resolve('r7.2');
});

test('Resolving an url', function() {
    expect(10);
    
    var s = new Simrou();
    
    var desiredMethod;
    var actionHandler = function(event, method) {
        equal(method, desiredMethod, 'Method == desiredMethod');
    };
    
    var r = s.addRoute('r1', function() {
        ok(true);
    }).get(actionHandler).post(actionHandler);
    
    // Specifing method a -> triggers a + *
    desiredMethod = 'get';
    s.resolve('r1', desiredMethod);
    
    // Specifing method b -> triggers b + *
    desiredMethod = 'post';
    s.resolve('r1', desiredMethod);
    
    // Not specifing a method triggers only *
    var b = s.resolve('r1');
    ok(b, 'Resolving an url successfuly makes resolve() return true.');
    
    // Not resolvable url does not trigger anything and returns false
    b = s.resolve('r2');
    equal(b, false, 'Resolving an url unsuccessfuly makes resolve() return false.');
    
    // Providing a falsy value for the url makes the router return false
    b = s.resolve(0);
    equal(b, false, 'Providing a falsy value for the url makes the router return false.');
    
    // If two routes match the url, only the one that got registered first gets triggered
    s.addRoute('*', function() {
        ok(false);
    });
    
    b = s.resolve('r1');
    ok(b, 'Resolving an url that has more than one match works.');
});

test('Navigating to an url', function() {
    expect(5);
    
    var s = new Simrou();
    var r = s.addRoute('r1').get(function() {
        ok(true);
    });
    
    // Navigate -> route should get resolved, loc.hash should change
    s.navigate('r1');
    equal(window.location.hash, '#r1', 'Navigating to an url updates window.location.hash to that url.');
    
    // Navigate to the same route again -> route should get resolved again
    s.navigate('r1');
    
    // Navigating to a not resolvable route -> hash should get
    // chained but no action handler get triggered
    var r = s.navigate('r2');
    equal(window.location.hash, '#r2', 'Navigation to an url that does not match any route updates the hash.');
    
    // Result should be "self"
    equal(r, s, 'Simrou.navigate() provides an fluid interface.');
    
    // Reset the hash (shouldn't trigger anything)
    window.location.hash = '';
});