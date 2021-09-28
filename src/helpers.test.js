import {
  isObject,
  isString,
} from './helpers';

describe('helpers', () => {
  describe('isObject', () => {
    it('should return true when typeof value is "object"', () => {
      expect(isObject(null)).toBe(true);
    });

    it('should return true when typeof value is not "object" but instanceof value is type Object', () => {
      expect(isObject(String)).toBe(true);
    });

    it('should return false when neither condition holds', () => {
      expect(isObject(true)).toBe(false);
    });
  });

  describe('isString', () => {
    it('should return true when typeof value is "string"', () => {
      expect(isString('a string')).toBe(true);
    });

    it('should return true when typeof value is not "string" but instanceof value is type String', () => {
      expect(isString(String())).toBe(true);
    });

    it('should return false when neither condition holds', () => {
      expect(isString(123)).toBe(false);
    });
  });
});
