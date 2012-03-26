module('core');

test('Basic requirements', function() {
    expect(6);
    
    // Check the environment
    ok(RegExp, 'RegExp');
    ok('onhashchange' in window, 'onHashChange event');
    ok(window.location, 'window.location');
    equal(typeof window.location.hash, 'string', 'window.location.hash is of type "string".');
    
    // Check if the window's hash works as expected
    window.location.hash = 'newHash';
    equal(window.location.hash, '#newHash', 'window.location.hash is writable.');
    
    window.location.hash = '#newHash';
    equal(window.location.hash, '#newHash', 'A trailing hash symbol gets ignored while writing to window.location.hash.');
});

test('jQuery', function() {
    expect(2);
    
    ok(jQuery, 'Presence');
    equal(jQuery.fn.jquery, '1.7.1');
});

test('Simrou - Instantiation', function() {
    var s;
    
    expect(4);
    
    // Check whether Simrou is available
    ok(Simrou, 'Presence');
    equal(typeof Simrou, 'function', 'Simrou is a function');
    
    s = new Simrou();
    ok(s instanceof Simrou, 'Using the new operator on Simrou returns a fresh instance.');
    
    s = Simrou();
    ok(s instanceof Simrou, 'Invoking Simrou() without the new operator returns a fresh instance as well.');
});