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

test('Resolving a url', function() {
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
    ok(b, 'Resolving a url successfuly makes resolve() return true.');
    
    // Not resolvable url does not trigger anything and returns false
    b = s.resolve('r2');
    equal(b, false, 'Resolving a url unsuccessfuly makes resolve() return false.');
    
    // Providing a falsy value for the url makes the router return false
    b = s.resolve(0);
    equal(b, false, 'Providing a falsy value for the url makes the router return false.');
    
    // If two routes match the url, only the one that got registered first gets triggered
    s.addRoute('*', function() {
        ok(false);
    });
    
    b = s.resolve('r1');
    ok(b, 'Resolving a url that has more than one match works.');
});

test('Navigating to a url', function() {
    expect(5);
    
    var s = new Simrou();
    var r = s.addRoute('r1').get(function() {
        ok(true);
    });
    
    // Navigate -> route should get resolved, loc.hash should change
    s.navigate('r1');
    equal(window.location.hash, '#r1', 'Navigating to a url updates window.location.hash to that url.');
    
    // Navigate to the same route again -> route should get resolved again
    s.navigate('r1');
    
    // Navigating to a not resolvable route -> hash should get
    // chained but no action handler get triggered
    var r = s.navigate('r2');
    equal(window.location.hash, '#r2', 'Navigation to a url that does not match any route updates the hash.');
    
    // Result should be "self"
    equal(r, s, 'Simrou.navigate() provides a fluid interface.');
    
    // Reset the hash (shouldn't trigger anything)
    window.location.hash = '';
});

// @todo => Port to asyncTest
test('Starting and stopping the router', function() {
    expect(9);
    
    var s = new Simrou();

    // Navigates to initial hash if hash was empty
    s.addRoute('rr1').get(function() {
        ok(true, 'If window.location.hash was empty, start() resolves the provided initial hash.');
    });
    
    var f = s.start('rr1');
    equal(f, s, 'Simrou.start() provides a fluid interface.');
    equal(window.location.hash, '#rr1', 'If window.location.hash was empty, start() navigates to the provided initial hash.');
    
    // Listens to hashchanges afterwards
    s.addRoute('rr2').get(function() {
        ok(true, 'The router listens to hash changes after start() was called.');
    });
    window.location.hash = 'rr2';
    
    // Listens to form submissions afterwards
    s.addRoute('rr3').post(function() {
        ok(true, 'The router listens to form submissions after start() was called.');
    });
    
    var $form = $('<form action="rr3" method="post"></form>');
    $('body').append($form);
    $form.submit();
    
    // After a form has been submitted, the hash should not have been altered
    equal(window.location.hash, '#rr2', 'A submitted form does not cause window.location.hash to be updated.');
    
    // Wait for the hashchange event to be dispatched
    return;
    
    // Stop stops those two behaviours
    s.addRoute('rr4', function() { ok(false); });
    s.addRoute('rr5', function() { ok(false); });
    
    f = s.stop();
    
    window.location.hash = 'rr4';
    $form.prop('action', 'rr5').on('submit', function() { return false; });
    $form.submit();
    
    equal(f, s, 'Simrou.stop() provides a fluid interface.');
    
    // Does not navigate to initial hash, if another hash is already set
    // but should try to resolve that hash instead
    s.addRoute('rr6').get(function() {
        ok(true, 'If window.location.hash is not empty when Simrou.start() is called, that hash gets resolved.');
    });
    
    window.location.hash = 'rr6';
    s.start('rr4').stop();
    
    // No initial hash and hash not set - nothing happens
    window.location.hash = '';
    s.start().stop();
    
    // Telling Simrou not to track hash changes
    s.addRoute('rr7', function() {
        ok(true, 'An initial routes gets stilled navigated to if hash change tracking is disabled.');
    });
    s.addRoute('rr8', function() { ok(false); });
    
    s.start('rr7', false, false);
    window.location.hash = 'rr8';
    window.location.hash = 'rr9';
    
    $form.prop('action', 'rr8');
    $form.submit();
    $form.remove();
});