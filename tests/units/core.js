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
    equal(typeof s.version, 'string', 'Simrou.version is a string.');
});

test('Registration and removal of routes', function() {
    expect(11);
    
    var s = new Simrou();
    
    // Register a route without arguments
    var r = s.registerRoute();
    equal(typeof r, 'object', 'RegisterRoute() returns an object.');
    equal(String(r.getRegExp()), '/^.+$/', 'Registering a new route without passing any arguments returns a wildcard route.');
    
    // Move everything to "route.js" ... test only registration and removal at this point!
    
    var m = r.match('asf');
    ok($.isArray(m), 'match("asf") returns an array for this route.');
    equal(m.length, 0, '...and that array is empty.');
    strictEqual(r.match(''), false, 'match("") === false');
    
    // Register a route and specify a static the pattern only
    r = s.registerRoute('asf');
    equal(String(r.getRegExp()), String(/^asf$/), 'Registering a route with a static pattern leads to the correct regular expression.');
    
    var m = r.match('asf');
    ok($.isArray(m), 'match("asf") return an array for this route.');
    equal(m.length, 0, '...and that array is empty.');
    strictEqual(r.match(''), false, 'match("") === false');
    strictEqual(r.match('qwe'), false, 'match("qwe") === false');
    
    // Register a route with mixed types of parameters in the pattern
    r = s.registerRoute('/test/:named/*splat/:anotherNamed/*');
    equal(String(r.getRegExp()), String(/^\/test\/([^\/]+)\/(.*?)\/([^\/]+)\/(.*?)$/),
        'Registering a route containing mixed parameter types returns the expected regular expression.');
});