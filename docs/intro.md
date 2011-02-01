Plants.js is a JavaScript test runner intended for use with Node.  It works well with [Zombie.js](http://zombie.labnotes.org/).

Get it at [github.com/alexyoung/plants.js](http://github.com/alexyoung/plants.js)

## Installation

Installing the library with npm will make the `plants` command available:

      npm install plants.js

Now run tests like this:

      plants test/*.js

## Usage

Tests are written in the CommonJS module style:

      var assert = require('assert');

      exports['test that tests run'] = function() {
        assert.ok(true);
      };

Setup and teardown is also supported:


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

## Asynchronous Support

Some tests might take a while to run.  The `plants` object is passed into each test, and it includes a `defer` method which can be used to wait until previous tests have finished:

      var assert = require('assert'),
          counter = 0;

      // Setup should run first
      exports['setup'] = function(plants) {
        plants.defer(function(next) {
          assert.equal(0, counter);
          next();
        });
      };

      exports['test asynchronously'] = function(plants) {
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


