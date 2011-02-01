require.paths.unshift('lib/');
var assert = require('assert');

exports['test pass reporting'] = function() {
  assert.ok(true, 'This is a pass');
};

exports['test fail reporting'] = function() {
  assert.ok(false, 'This is a fail');
};

