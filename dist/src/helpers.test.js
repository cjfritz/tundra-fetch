'use strict';

var _helpers = require('./helpers');

describe('helpers', function () {
  describe('isObject', function () {
    it('should return true when typeof value is "object"', function () {
      expect((0, _helpers.isObject)(null)).toBe(true);
    });

    it('should return true when typeof value is not "object" but instanceof value is type Object', function () {
      expect((0, _helpers.isObject)(String)).toBe(true);
    });

    it('should return false when neither condition holds', function () {
      expect((0, _helpers.isObject)(true)).toBe(false);
    });
  });

  describe('isString', function () {
    it('should return true when typeof value is "string"', function () {
      expect((0, _helpers.isString)('a string')).toBe(true);
    });

    it('should return true when typeof value is not "string" but instanceof value is type String', function () {
      expect((0, _helpers.isString)(String())).toBe(true);
    });

    it('should return false when neither condition holds', function () {
      expect((0, _helpers.isString)(123)).toBe(false);
    });
  });
});

//# sourceMappingURL=helpers.test.js.map