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
    var r = s.registerRoute();
    equal(typeof r, 'object', 'RegisterRoute() returns an object.');
    
    // Register route and attach fallback action handler right away
    s = new Simrou();
    r = s.registerRoute('r1', function() {
        ok(true, 'A single action handler can be attached right away while registering the route.');
    });
    s.resolve('r1');
    
    // Register route and attach multiple action handlers right away
    r = s.registerRoute('r2', {
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
    r = s.registerRoute('r3', function() {
        ok(false, 'A route object can be removed (via the route object).');
    });
    
    s.removeRoute(r);
    s.resolve('r3');
    
    // Remove route via route pattern
    r = s.registerRoute('r4', function() {
        ok(false, 'A route object can be removed (via the route pattern).');
    });
    
    s.removeRoute('r4');
    s.resolve('r4');
    
    // Reattach a route
    r = s.registerRoute('r5', function() {
        ok(true, 'A route object can be reattached.');
    });
    s.removeRoute(r);
    s.registerRoute(r);
    s.resolve('r5');
    
    // Register multiple routes (via array)
    r = s.registerRoutes(['r6.1', 'r6.2']);
    ok($.isArray(r), 'RegisterRoutes(array) returns an array.');
    equal(typeof r[0], 'object', '...that contains objects (1/2)');
    equal(typeof r[1], 'object', '...that contains objects (2/2)');
    ok(r[0].attachAction, '...of type Simrou.Route (1/2)');
    ok(r[1].attachAction, '...of type Simrou.Route (2/2)');
    
    // Register multiple routes (via object)
    r = s.registerRoutes({
        'r7.1': function() {
            ok(true, 'RegisterRoutes(object) can attach action handlers. (1/2)');
        },
        'r7.2': function() {
            ok(true, 'RegisterRoutes(object) can attach action handlers. (2/2)');
        }
    });
    
    ok($.isPlainObject(r), 'RegisterRoutes(object) returns an object.');
    ok(r['r7.1'], '...that contains values with the route patterns as keys (1/2)');
    ok(r['r7.2'], '...that contains values with the route patterns as keys (2/2)');
    equal(typeof r['r7.1'], 'object', '...that are objects (1/2)');
    equal(typeof r['r7.2'], 'object', '...that are objects (2/2)');
    ok(r['r7.1'].attachAction, '...of type Simrou.Route (1/2)');
    ok(r['r7.2'].attachAction, '...of type Simrou.Route (2/2)');
    
    s.resolve('r7.1');
    s.resolve('r7.2');
});