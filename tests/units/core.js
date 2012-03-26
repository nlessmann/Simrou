module('Core');

test('Instantiation', function() {
    expect(5);
    var s;
    
    // Check whether Simrou is available
    ok(Simrou, 'Presence');
    equal(typeof Simrou, 'function', 'Simrou is a function');
    
    // Test the creation of a new instance
    s = new Simrou();
    ok(s instanceof Simrou, 'Using the new operator on Simrou returns a fresh instance.');
    
    s = Simrou();
    ok(s instanceof Simrou, 'Invoking Simrou() without the new operator returns a fresh instance as well.');
    
    // Check if the information about the current version is present
    equal(typeof s.version, 'string', 'Simrou.version is a string.');
});