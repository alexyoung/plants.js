require.paths.unshift('lib/');
var assert = require('assert'),
    counter = 0;

// Setup should run first
exports['setup'] = function(plants) {
  plants.defer(function(next) {
    assert.equal(0, counter);
    next();
  });
};

exports['test asynchronous events delay teardown'] = function(plants) {
  plants.defer(function(next) {
    setTimeout(function() {
      counter++;
      assert.ok(true);
      next();
    }, 1000);
  });
};

exports['teardown'] = function() {
  assert.equal(1, counter);
};

