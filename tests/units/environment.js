module('Environment');

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
    
    // Reset the hash
    window.location.hash = '';
});

test('jQuery', function() {
    expect(2);
    
    ok(jQuery, 'Presence');
    equal(jQuery.fn.jquery, '1.7.1', 'The jQuery version is 1.7.1');
});
