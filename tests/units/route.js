module('Route');

/*
    equal(String(r.getRegExp()), '/^.+$/', 'Registering a new route without passing any arguments returns a wildcard route.');
    
    deepEqual(r.match('asf'), [], 'match("asf") returns an empty array for this route.');
    strictEqual(r.match(''), false, 'match("") === false');
    
    // Register a route and specify a static the pattern only
    r = s.registerRoute('asf');
    equal(String(r.getRegExp()), String(/^asf$/), 'Registering a route with a static pattern leads to the correct regular expression.');
    
    deepEqual(r.match('asf'), 'match("asf") return an empty array for this route.');
    strictEqual(r.match(''), false, 'match("") === false');
    strictEqual(r.match('qwe'), false, 'match("qwe") === false');
    
    // Register a route with mixed types of parameters in the pattern
    r = s.registerRoute('/test/:named/*splat/:anotherNamed/*');
    equal(String(r.getRegExp()), String(/^\/test\/([^\/]+)\/(.*?)\/([^\/]+)\/(.*?)$/),
        'Registering a route containing mixed parameter types returns the expected regular expression.');
        
*/