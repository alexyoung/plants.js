// run plants test.js

var assert = require('assert'),
    zombie = require('zombie'),
    path = require('path'),
    app = require(path.join(__dirname, 'app')).app;

app.listen(3001);

exports['test index page'] = function(plants) {
  plants.defer(function(next) {
    zombie.visit('http://localhost:3001', function(err, browser, status) {
      assert.equal(browser.text('title'), 'Test');
      next();
    });
  });
};

exports['test login'] = function(plants) {
  plants.defer(function(next) {
    zombie.visit('http://localhost:3001/login', function(err, browser, status) {
      browser.
        fill('username', 'alex').
        fill('password', 'test').
        pressButton('Log In', function(err, browser, status) {
          assert.equal(browser.text('h1'), 'Logged In');
          next();
        });
    });
  });
};

