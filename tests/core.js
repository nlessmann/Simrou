module('core');

test('a basic test example', function() {
  ok(true, 'this test is fine');
  var value = 'hello';
  equal(value, 'hallo', 'We expect value to be hello');
});