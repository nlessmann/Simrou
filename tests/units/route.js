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

test('Assembling a route', function() {
    expect(4);
    
    var s = new Simrou();
    var r = s.registerRoute('/test/:named/*splat/:anotherNamed/*');
    
    // Test normal assembling
    var a = r.assemble('mr', 'john', 'doe', 'junior');
    equal(a, '/test/mr/john/doe/junior', 'Assembling a route with values for all parameters works.');
    
    // Miss out the last two parametes
    a = r.assemble('mr', 'john');
    equal(a, '/test/mr/john//', 'Assembling a route with values for only some of the parameters works.');
    
    // Hand over an array instead of single parameters
    a = r.assemble(['mr', 'john', 'doe', 'junior']);
    equal(a, '/test/mr/john/doe/junior', 'Providing the values in an array works.');
    
    // Hand over functions
    a = r.assemble('mr', function() { return 'john'; }, 'doe', 'junior');
    equal(a, '/test/mr/john/doe/junior', 'Providing a function for a parameter works.');
});