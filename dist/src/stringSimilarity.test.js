'use strict';

var _stringSimilarity = require('./stringSimilarity');

var _stringSimilarity2 = _interopRequireDefault(_stringSimilarity);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('stringSimilarity', function () {
  var WILDCARD = '{{*}}';
  var originalString = '{"a": {{*}}, "b": {{*}}123, "c": 123{{*}}, ' + '"d": 123{{*}}456, "e": "{{*}}", "f": "{{*}}abc", "g": "abc{{*}}" ' + '"h": "abc{{*}}123", "i": {{*}}}';
  var quotedString = '{"a": "{{%}}", "b": "{{%}}123", "c": "123{{%}}", ' + '"d": "123{{%}}456", "e": "{{*}}", "f": "{{*}}abc", "g": "abc{{*}}" ' + '"h": "abc{{*}}123", "i": "{{%}}"}';

  describe('recursiveKeySort', function () {
    it('should return the argument if it is falsy', function () {
      expect((0, _stringSimilarity.recursiveKeySort)(null)).toBe(null);
    });

    it('should return the argument if it is not an object', function () {
      var argument = 'not an object';
      expect((0, _stringSimilarity.recursiveKeySort)(argument)).toBe(argument);
    });

    it('should return the argument with object keys sorted', function () {
      var param = {
        someArray: ['something', { z: undefined, someProp: 'someProp', anotherProp: 1 }],
        aProp: {
          someProp: { yetAnotherProp: null, anotherProp: true },
          a: 'a'
        },
        prop1: 'prop1'
      };

      var expectedResult = {
        aProp: {
          a: 'a',
          someProp: { anotherProp: true, yetAnotherProp: null }
        },
        prop1: 'prop1',
        someArray: ['something', { anotherProp: 1, someProp: 'someProp', z: undefined }]
      };

      expect((0, _stringSimilarity.recursiveKeySort)(param)).toStrictEqual(expectedResult);
    });
  });

  describe('replaceWildcards', function () {
    it('returns the original value argument when no matches are found', function () {
      var value = 'some string without wildcards';
      expect((0, _stringSimilarity.replaceWildcards)(value)).toBe(value);
    });

    it('should find and replace all unquoted wildcards properly', function () {
      expect((0, _stringSimilarity.replaceWildcards)(originalString, true)).toEqual(quotedString);
    });
  });

  describe('restoreWildcards', function () {
    it('returns the original value argument when no matches are found', function () {
      var value = 'some string with a {{*}}';
      expect((0, _stringSimilarity.restoreWildcards)(value)).toBe(value);
    });

    it('should find and replace all quoted wildcards properly', function () {
      expect((0, _stringSimilarity.restoreWildcards)(quotedString)).toEqual(originalString);
    });
  });

  describe.each([true, false])('when shouldSortObjectKeys is %s', function (shouldSortObjectKeys) {
    it('should match a target with a valid pattern', function () {
      expect((0, _stringSimilarity2.default)('before' + WILDCARD + 'after', 'beforesomethingafter', shouldSortObjectKeys)).toBe(true);
    });

    it('should match a target with a valid pattern at the beginning', function () {
      expect((0, _stringSimilarity2.default)(WILDCARD + 'after', 'somethingafter', shouldSortObjectKeys)).toBe(true);
    });

    it('should match a target with a valid pattern at the end', function () {
      expect((0, _stringSimilarity2.default)('before' + WILDCARD, 'beforesomething', shouldSortObjectKeys)).toBe(true);
    });

    it('should match a target without populated pattern', function () {
      expect((0, _stringSimilarity2.default)('before' + WILDCARD + 'after', 'beforeafter', shouldSortObjectKeys)).toBe(true);
    });

    it('should match a target against a source without a wildcard', function () {
      expect((0, _stringSimilarity2.default)('string1', 'string1', shouldSortObjectKeys)).toBe(true);
    });

    it('should not match a target against a source without a wildcard', function () {
      expect((0, _stringSimilarity2.default)('string1', 'string2', shouldSortObjectKeys)).toBe(false);
    });

    it('should not match a target with an empty source', function () {
      expect((0, _stringSimilarity2.default)('', 'something', shouldSortObjectKeys)).toBe(false);
    });

    it('should match an empty target against a wildcarded source', function () {
      expect((0, _stringSimilarity2.default)('' + WILDCARD, '', shouldSortObjectKeys)).toBe(true);
    });

    it('should match an null target against a wildcarded source', function () {
      expect((0, _stringSimilarity2.default)('' + WILDCARD, null, shouldSortObjectKeys)).toBe(true);
    });

    it('should match if the source and target are both null', function () {
      expect((0, _stringSimilarity2.default)(null, null, shouldSortObjectKeys)).toBe(true);
    });

    it('should not match if the source and target are undefined and null', function () {
      expect((0, _stringSimilarity2.default)(null, undefined, shouldSortObjectKeys)).toBe(false);
    });

    it('should not match if the source and target are undefined and null', function () {
      expect((0, _stringSimilarity2.default)(null, 'something', shouldSortObjectKeys)).toBe(false);
    });
  });

  describe('when source and target are valid JSON request bodies and shouldSortObjectKeys is true', function () {
    describe('when wildcards are present in source', function () {
      it('should not match when a wildcard is detected in a property key', function () {
        var source = '{ "some{{*}}": "someValue", "someOtherKey": "someOtherValue" }';
        var target = '{ "someKey": "someValue" }';

        expect((0, _stringSimilarity2.default)(source, target, true)).toBe(false);
      });

      it('should match when source and target are equivalent', function () {
        var source = '{ "someOtherKey": "some{{*}}Value", "someKey": "{{*}}" }';
        var target = '{ "someKey": "someValue", "someOtherKey": "someOtherValue" }';

        expect((0, _stringSimilarity2.default)(source, target, true)).toBe(true);
      });

      it('should not match when source and target are not equivalent', function () {
        var source = '{ "someOtherKey": "some{{*}}Value", "someKey": "{{*}}" }';
        var target = '{ "someKey": "someValue", "someOtherKey": "somethingDifferent" }';

        expect((0, _stringSimilarity2.default)(source, target, true)).toBe(false);
      });
    });

    describe('when wildcards are not present in source', function () {
      it('should match when source and target are equivalent', function () {
        var source = '{ "someOtherKey": "someOtherValue", "someKey": "someValue" }';
        var target = '{ "someKey": "someValue", "someOtherKey": "someOtherValue" }';

        expect((0, _stringSimilarity2.default)(source, target, true)).toBe(true);
      });

      it('should not match when source and target are equivalent', function () {
        var source = '{ "someOtherKey": "someOtherValue", "someKey": "someValue" }';
        var target = '{ "someDifferentKey": "someValue", "someOtherKey": "someOtherValue" }';

        expect((0, _stringSimilarity2.default)(source, target, true)).toBe(false);
      });
    });
  });
});
//# sourceMappingURL=stringSimilarity.test.js.map