'use strict';

/* deps: mocha */
var assert = require('assert');
var should = require('should');
var expand = require('./support/expand');
var toRegexRange = require('..');
var regex;

function toRegex(min, max) {
  return new RegExp('^(' + toRegexRange(min, max) + ')$');
}

function match(min, max) {
  var regex = toRegex(min, max);
  return function (num) {
    return regex.test(num.toString());
  };
}

function verifyRange(min, max, from, to) {
  var isMatch = match(min, max);
  var range = expand(from, to);
  var len = range.length, i = -1;

  while (++i < len) {
    var num = range[i];

    if (min <= num && num <= max) {
      assert.equal(isMatch(num), true);
    } else {
      assert.equal(isMatch(num), false);
    }
  }
}

describe('toRegexRange', function () {
  it('should throw an error when the first arg is invalid:', function () {
    (function () {
      toRegexRange();
    }).should.throw('toRegexRange: first argument is invalid.');
  });

  it('should throw an error when the second arg is invalid:', function () {
    (function () {
      toRegexRange(1, {});
    }).should.throw('toRegexRange: second argument is invalid.');
  });
});

describe('toRegexRange', function () {
  it('should return the number when only one argument is passed:', function () {
    assert.equal(toRegexRange(5), '5');
  });

  it('should not return a range when both numbers are the same:', function () {
    assert.equal(toRegexRange(5, 5), '5');
  });

  it('should support ranges than 10:', function () {
    assert.equal(toRegexRange(1, 5), '[1-5]');
  });

  it('should support strings:', function () {
    assert.equal(toRegexRange('1', '5'), '[1-5]');
    assert.equal(toRegexRange('10', '50'), '1\\d|[2-4]\\d|50');
  });

  it('should generate regular expressions from the given pattern', function () {
    assert.equal(toRegexRange(1, 1), '1');
    assert.equal(toRegexRange(0, 1), '[0-1]');
    assert.equal(toRegexRange(-1, -1), '-1');
    assert.equal(toRegexRange(-1, 0), '-1|0');
    assert.equal(toRegexRange(-1, 1), '-1|[0-1]');
    assert.equal(toRegexRange(-4, -2), '-[2-4]');
    assert.equal(toRegexRange(-3, 1), '-[1-3]|[0-1]');
    assert.equal(toRegexRange(-2, 0), '-[1-2]|0');
    assert.equal(toRegexRange(0, 2), '[0-2]');
    assert.equal(toRegexRange(-1, 3), '-1|[0-3]');
    assert.equal(toRegexRange(65666, 65667), '6566[6-7]');
    assert.equal(toRegexRange(12, 3456), '1[2-9]|[2-9]\\d|[1-9]\\d{2}|[1-2]\\d{3}|3[0-3]\\d{2}|34[0-4]\\d|345[0-6]');
    assert.equal(toRegexRange(1, 3456), '[1-9]|[1-9]\\d|[1-9]\\d{2}|[1-2]\\d{3}|3[0-3]\\d{2}|34[0-4]\\d|345[0-6]');
    assert.equal(toRegexRange(1, 10), '[1-9]|10');
    assert.equal(toRegexRange(1, 19), '[1-9]|1\\d');
    assert.equal(toRegexRange(1, 99), '[1-9]|[1-9]\\d');
  });

  it('should optimize regexes', function () {
    assert.equal(toRegexRange(-9, 9), '-[1-9]|\\d');
    assert.equal(toRegexRange(-19, 19), '-[1-9]|-?1\\d|\\d');
    assert.equal(toRegexRange(-29, 29), '-[1-9]|-?[1-2]\\d|\\d');
    assert.equal(toRegexRange(-99, 99), '-[1-9]|-?[1-9]\\d|\\d');
    assert.equal(toRegexRange(-999, 999), '-[1-9]|-?[1-9]\\d|-?[1-9]\\d{2}|\\d');
    assert.equal(toRegexRange(-9999, 9999), '-[1-9]|-?[1-9]\\d|-?[1-9]\\d{2}|-?[1-9]\\d{3}|\\d');
  });
});


describe('validate ranges', function () {
  it('should support equal numbers:', function () {
    verifyRange(1, 1, 0, 100);
    verifyRange(65443, 65443, 65000, 66000);
    verifyRange(192, 1000, 0, 1000);
  });

  it('should support large numbers:', function() {
    verifyRange(100019999300000, 100020000300000, 100019999999999, 100020000100000);
  });

  it('should support repeated digits:', function() {
    verifyRange(10331, 20381, 0, 99999);
  });

  it('should support repeated zeros:', function() {
    verifyRange(10031, 20081, 0, 59999);
    verifyRange(10000, 20000, 0, 59999);
  });

  it('should support zero one:', function() {
    verifyRange(10301, 20101, 0, 99999);
  });

  it('should support repetead ones:', function() {
    verifyRange(102, 111, 0, 1000);
  });

  it('should support small diffs:', function() {
    verifyRange(102, 110, 0, 1000);
    verifyRange(102, 130, 0, 1000);
  });

  it('should support random ranges:', function() {
    verifyRange(4173, 7981, 0, 99999);
  });

  it('should support one digit numbers:', function () {
    verifyRange(3, 7, 0, 99);
  });

  it('should support one digit at bounds:', function () {
    verifyRange(1, 9, 0, 1000);
  });

  it('should support power of ten:', function() {
    verifyRange(1000, 8632, 0, 99999);
  });

  it('should work with numbers of varying lengths:', function () {
    verifyRange(1030, 20101, 0, 99999);
    verifyRange(13, 8632, 0, 10000);
  });

  it('should support small ranges:', function() {
    verifyRange(9, 11, 0, 100);
    verifyRange(19, 21, 0, 100);
  });

  it('should support big ranges:', function () {
    verifyRange(90, 98009, 0, 98999);
    verifyRange(999, 10000, 1, 20000);
  });
});