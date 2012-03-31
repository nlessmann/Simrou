module('Route');

test('Wildcard routes', function() {
    expect(3);
    
    // Register a route without arguments
    var s = new Simrou();
    var r = s.addRoute();
    equal(r.getRegExp().toString(), '/^.+$/', 'Registering a new route without passing any arguments returns a wildcard route.');
    
    deepEqual(r.match('asf'), [], 'match("asf") returns an empty array.');
    strictEqual(r.match(''), false, 'match("") === false');
});

test('Static routes', function() {
    expect(4);
    
    // Register a route and specify a static pattern only
    var s = new Simrou();
    var r = s.addRoute('fsa');
    equal(r.getRegExp().toString(), /^fsa$/.toString(), 'Correct RegExp');
    
    deepEqual(r.match('fsa'), [], 'match("fsa") returns an empty array.');
    strictEqual(r.match(''), false, 'match("") === false');
    strictEqual(r.match('qwe'), false, 'match("qwe") === false');
});

test('Dynamic routes', function() {
    expect(5);
    
    // Register a route with mixed types of parameters in the pattern
    var s = new Simrou();
    var r = s.addRoute('/test/:named/*splat/:anotherNamed/*');
    equal(r.getRegExp().toString(), /^\/test\/([^\/]+)\/(.*?)\/([^\/]+)\/(.*?)$/.toString(),
        'Correct RegExp');
    
    var a1 = r.match('/test/mr/john/william/smith/junior/the/third'),
        a2 = ['mr', 'john', 'william', 'smith/junior/the/third'];
    deepEqual(a1, a2, 'Parameters get correctly extracted.');
    strictEqual(r.match(''), false, 'match("") === false');
    strictEqual(r.match('qwe'), false, 'match("qwe") === false');
    strictEqual(r.match('/test/mr/john/william'), false, 'Last parameter missing => false gets returned');
});

test('Regular expression routes', function() {
    expect(4);
    
    // Register a route based on a regular expression
    var s = new Simrou();
    var p = /^abc([0-9]{3})$/;
    
    var r = s.addRoute(p);
    equal(r.getRegExp().toString(), p.toString(), 'Regexp based route: Correct RegExp');
    
    deepEqual(r.match('abc123'), ['123'], 'Parameters get correctly extracted.');
    strictEqual(r.match(''), false, 'match("") === false');
    strictEqual(r.match('qwe'), false, 'match("qwe") === false');
});



test('Assembling a route', function() {
    expect(5);
    
    var s = new Simrou();
    var r = s.addRoute('/test/:named/*splat/:anotherNamed/*');
    
    // Test normal assembling
    var a = r.assemble(0, 'john', 'doe', 'junior');
    equal(a, '/test/0/john/doe/junior', 'Assembling a route with values for all parameters works.');
    
    // Miss out the last two parametes
    a = r.assemble('mr', 'john');
    equal(a, '/test/mr/john//', 'Assembling a route with values for only some of the parameters works.');
    
    // Hand over an array instead of single parameters
    a = r.assemble(['mr', 'john', 'doe', 'junior']);
    equal(a, '/test/mr/john/doe/junior', 'Providing the values in an array works.');
    
    // Hand over functions
    a = r.assemble('mr', function() { return 'john'; }, 'doe', 'junior');
    equal(a, '/test/mr/john/doe/junior', 'Providing a function for a parameter works.');
    
    // Try to assemble a route based on a regular expression
    r = s.addRoute(/^.+$/);
    raises(r.assemble, 'Trying to assemble a route that is based on a regular expression fails.');
    
});