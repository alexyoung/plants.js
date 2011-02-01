require.paths.unshift('lib/');
var assert = require('assert'),
    counter = 0;

// Setup should run first
exports['setup'] = function() {
  assert.equal(0, counter);
};

exports['test that tests run'] = function() {
  counter++;
  assert.ok(true);
};

exports['teardown'] = function() {
  assert.equal(1, counter);
};

