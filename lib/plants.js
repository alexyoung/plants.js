/**
 * Plants.js
 * Copyright (C) 2011 Alex R. Young
 * MIT Licensed
 */

var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    _ = require('underscore'),
    logger,
    Tests,
    printMessage,
    colorize = true,
    runner,
    version = '0.0.1';

/**
 * Print a message to the console.
 *
 * @param {String} message The message to print
 * @param {String} [className] The type of message: pass, fail
 * @param {String} [prefix] A symbol that should appear before the message
 */
printMessage = (function() {
  function messageTypeToColor(messageType) {
    switch (messageType) {
      case 'pass':
        return '32';
      break;

      case 'fail':
        return '31';
      break;
    }

    return '';
  }

  return function(message, messageType, prefix) {
    var col      = colorize ? messageTypeToColor(messageType) : false;
        startCol = col ? '\033[' + col + 'm' : '',
        endCol   = col ? '\033[0m' : '',
    console.log(startCol + (prefix ? prefix + ' ' : '') + message + endCol);
  };
})();

logger = {
  /**
   * Display a message.
   *
   * @param {String} message The message to print
   * @param {String} [className] The type of message: pass, fail
   * @param {String} [prefix] A symbol that should appear before the message
   */
  display: function(message, className, prefix) {
    printMessage(message, className || 'trace', prefix || '');
  },

  /**
   * Display an error.
   *
   * @param {String} message The message to print
   */
  error: function(message) {
    logger.display(message, 'error', '\u2620');
  },

  /**
   * Display a passed test with a message.
   *
   * @param {String} message The message to print
   */
  pass: function(message) {
    logger.display(message, 'pass', '\u2713');
  },

  /**
   * Display a failed test.
   *
   * @param {String} message The message to print
   */
  fail: function(message) {
    logger.display(message, 'fail', '\u2715');
  }
};

function TestRunner() {
  this.files = [];
  this.results = [];
  this.passed = 0;
  this.failed = 0;
  this.errors = 0;
  this.deferred = 0;
  this.events = new EventEmitter();
  this.testObject = null;
  this.installEvents();
}

TestRunner.prototype = {
  /**
   * Generates a test result with a name and message.
   *
   * @param {String} testName The test's name
   * @returns {Object} An object with a name and message
   */
  Result: function(testName) {
    return { name: testName, message: null };
  },

  /**
   * Get a list of test names for the current `testObject`.
   *
   * @returns {Array} A list of test names
   */
  findTests: function() {
    return _(this.testObject).chain()
      .map(function(fn, name) {
        if (/^test/i.test(name)) return name;
      })
      .compact()
      .value();
  },

  /**
   * Sets up the events required by tests.
   */
  installEvents: function() {
    this.on('setup', _.bind(this.runSetup, this));
    this.on('teardown', _.bind(this.runTeardown, this));
    this.on('next', _.bind(this.runNext, this));
  },

  /**
   * Runs the next test if there are no deferred functions.
   */
  nextIfNotDeferred: function() {
    if (this.deferred === 0) this.emit('next');
  },

  /**
   * Runs the next test.
   */
  runNext: function() {
    if (!this.tests) return;

    if (this.tests.length > 0) {
      var testName = this.tests.shift();
      this.run(testName);
      this.nextIfNotDeferred();
    } else {
      this.emit('teardown');
    }
  },

  /**
   * Runs the `setup` function if it's present, then the next test.
   */
  runSetup: function() {
    if (this.testObject.hasOwnProperty('setup'))
      this.testObject.setup(this);
    this.nextIfNotDeferred();
  },

  /**
   * Runs the `teardown` function if it's present.
   */
  runTeardown: function() {
    if (this.testObject.hasOwnProperty('teardown'))
      this.testObject.teardown(this);
    this.emit('end');
  },

  /**
   * Sets the current `testObject`, then emits `setup`.
   */
  runTestObject: function(obj) {
    this.testObject = obj;
    this.tests = this.findTests();
    this.emit('setup');
  },

  toString: function() {
    return util.inspect(this);
  },

  /**
   * Convenience accessor for the events object.
   */
  emit: function(name) {
    this.events.emit(name);
  },

  /**
   * Convenience accessor for the events object.
   */
  on: function() {
    this.events.on.apply(this.events, arguments);
  },

  /**
   * Runs a test in the current `testObject`, will call itself
   * recursively if the test is an object that contains sub-tests.
   *
   * @param {String} testName The name of the test
   */
  run: function(testName) {
    this.deferred++;
    var result = new this.Result(testName);

    function showException(e) {
      if (!!e.stack) {
        logger.display(e.stack);
      } else {
        logger.display(e);
      }
    }

    if (typeof this.testObject[testName] === 'object') {
      logger.display('Running: ' + testName);
      return this.runTestObject(this.testObject[testName]);
    }

    try {
      this.testObject[testName](this);
      this.passed += 1;
      logger.pass(testName);
    } catch (e) {
      if (e.name === 'AssertionError') {
        result.message = e.toString();
        logger.fail('Assertion failed in: ' + testName);
        showException(e);
        this.failed += 1;
      } else {
        logger.error('Error in: ' + testName);
        showException(e);
        this.errors += 1;
      }
    } finally {
      this.deferred--;
    }

    this.results.push(result);
  },

  /**
   * Defers a function and passes in the current Plants object.
   * The passed-in function will get a method that must be called
   * to signal completion of an asynchronous operation.
   *
   * @param {Function} callback A function that may not finish sequentially
   */
  defer: function(callback) {
    this.deferred++;
    callback(_.bind(function() {
      this.deferred--;

      if (this.deferred === 0) {
        if (this.tests.length > 0) {
          this.emit('next');
        } else {
          this.emit('teardown');
        }
      }
    }, this));
  },

  /**
   * Displays all test results.
   */
  report: function() {
    logger.pass('Passed: ' + this.passed);
    logger.fail('Failed: ' + this.failed);
    logger.error('Errors: ' + this.errors);
    process.exit(this.errors > 0 || this.failed > 0 ? 1 : 0);
  },

  /**
   * Runs a file's tests.
   *
   * @param {String} file The file name to run
   * @param {Object} tests An object containing methods that start with 'test', and may include 'setup' and 'teardown'
   */
  runFile: function(file, tests) {
    logger.display('Loaded file ' + file);
    this.runTestObject(tests);
    logger.display('');
  },

  /**
   * Runs all tests.
   */
  runAll: function() {
    if (this.deferred > 0) {
      setTimeout(_.bind(function() { this.runAll(); }, this), 100);
    } else if (this.files.length > 0) {
      var file = this.files.shift();
      try {
        this.runFile(file, require(file));
        this.runAll();
      } catch (exception) {
        error('Error in file: ' + file);
        logger.display(exception);
        logger.display('');
        throw(exception);
      }
    } else if (this.files.length === 0 && this.deferred === 0) {
      this.report();
    }
  }
};

runner = new TestRunner()

function error() {
  runner.errors++;
  return logger.error.apply(this, arguments);
};

/**
 * Displays an error, available publicly.
 *
 * @param {String} message A message to display
 */
exports.error = error;

/**
 * Displays a message, available publicly.
 *
 * @param {String} message A message to display
 */
exports.display = logger.display;

/**
 * Runs tests, available publicly.
 *
 * @param {String} message A message to display
 */
exports.run = function(files) {
  runner.files = files;
  runner.runAll();
};

exports.version = version;
