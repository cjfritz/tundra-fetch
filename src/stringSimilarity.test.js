import stringSimilarity, {
  recursiveKeySort,
  replaceWildcards,
} from './stringSimilarity';

describe('stringSimilarity', () => {
  const WILDCARD = '{{*}}';

  describe('recursiveKeySort', () => {
    it('should return the argument if it is falsy', () => {
      expect(recursiveKeySort(null)).toBe(null);
    });

    it('should return the argument if it is not an object', () => {
      const argument = 'not an object';
      expect(recursiveKeySort(argument)).toBe(argument);
    });

    it('should return the argument with object keys sorted', () => {
      const param = {
        someArray: [
          'something',
          { z: undefined, someProp: 'someProp', anotherProp: 1 },
        ],
        aProp: {
          someProp: { yetAnotherProp: null, anotherProp: true },
          a: 'a',
        },
        prop1: 'prop1',
      };

      const expectedResult = {
        aProp: {
          a: 'a',
          someProp: { anotherProp: true, yetAnotherProp: null },
        },
        prop1: 'prop1',
        someArray: ['something', { anotherProp: 1, someProp: 'someProp', z: undefined }],
      };

      expect(recursiveKeySort(param)).toStrictEqual(expectedResult);
    });
  });

  describe('replaceWildcards', () => {
    const originalString = '{"a": {{*}}, "b": {{*}}123, "c": 123{{*}}, '
      + '"d": 123{{*}}456, "e": "{{*}}", "f": "{{*}}abc", "g": "abc{{*}}" '
      + '"h": "abc{{*}}123", "i": {{*}}}';
    const quotedString = '{"a": "{{%}}", "b": "{{%}}123", "c": "123{{%}}", '
      + '"d": "123{{%}}456", "e": "{{*}}", "f": "{{*}}abc", "g": "abc{{*}}" '
      + '"h": "abc{{*}}123", "i": "{{%}}"}';

    it.each([true, false])('returns the original value argument when no matches are found', (makeParsable) => {
      const value = 'some string without wildcards';
      expect(replaceWildcards(value, makeParsable)).toBe(value);
    });

    it('should find and replace all unquoted wildcards properly', () => {
      expect(replaceWildcards(originalString, true)).toEqual(quotedString);
    });

    it('should find and replace all quoted wildcards properly', () => {
      expect(replaceWildcards(quotedString)).toEqual(originalString);
    });
  });

  describe.each([true, false])('when shouldSortObjectKeys is %s', (shouldSortObjectKeys) => {
    it('should match a target with a valid pattern', () => {
      expect(stringSimilarity(`before${WILDCARD}after`, 'beforesomethingafter', shouldSortObjectKeys)).toBe(true);
    });

    it('should match a target with a valid pattern at the beginning', () => {
      expect(stringSimilarity(`${WILDCARD}after`, 'somethingafter', shouldSortObjectKeys)).toBe(true);
    });

    it('should match a target with a valid pattern at the end', () => {
      expect(stringSimilarity(`before${WILDCARD}`, 'beforesomething', shouldSortObjectKeys)).toBe(true);
    });

    it('should match a target without populated pattern', () => {
      expect(stringSimilarity(`before${WILDCARD}after`, 'beforeafter', shouldSortObjectKeys)).toBe(true);
    });

    it('should match a target against a source without a wildcard', () => {
      expect(stringSimilarity('string1', 'string1', shouldSortObjectKeys)).toBe(true);
    });

    it('should not match a target against a source without a wildcard', () => {
      expect(stringSimilarity('string1', 'string2', shouldSortObjectKeys)).toBe(false);
    });

    it('should not match a target with an empty source', () => {
      expect(stringSimilarity('', 'something', shouldSortObjectKeys)).toBe(false);
    });

    it('should match an empty target against a wildcarded source', () => {
      expect(stringSimilarity(`${WILDCARD}`, '', shouldSortObjectKeys)).toBe(true);
    });

    it('should match an null target against a wildcarded source', () => {
      expect(stringSimilarity(`${WILDCARD}`, null, shouldSortObjectKeys)).toBe(true);
    });

    it('should match if the source and target are both null', () => {
      expect(stringSimilarity(null, null, shouldSortObjectKeys)).toBe(true);
    });

    it('should not match if the source and target are undefined and null', () => {
      expect(stringSimilarity(null, undefined, shouldSortObjectKeys)).toBe(false);
    });

    it('should not match if the source and target are undefined and null', () => {
      expect(stringSimilarity(null, 'something', shouldSortObjectKeys)).toBe(false);
    });
  });

  describe('when source and target are valid JSON request bodies and shouldSortObjectKeys is true', () => {
    describe('when wildcards are present in source', () => {
      it('should not match when a wildcard is detected in a property key', () => {
        const source = '{ "some{{*}}": "someValue", "someOtherKey": "someOtherValue" }';
        const target = '{ "someKey": "someValue" }';

        expect(stringSimilarity(source, target, true)).toBe(false);
      });

      it('should match when source and target are equivalent', () => {
        const source = '{ "someOtherKey": "some{{*}}Value", "someKey": "{{*}}" }';
        const target = '{ "someKey": "someValue", "someOtherKey": "someOtherValue" }';

        expect(stringSimilarity(source, target, true)).toBe(true);
      });

      it('should not match when source and target are not equivalent', () => {
        const source = '{ "someOtherKey": "some{{*}}Value", "someKey": "{{*}}" }';
        const target = '{ "someKey": "someValue", "someOtherKey": "somethingDifferent" }';

        expect(stringSimilarity(source, target, true)).toBe(false);
      });
    });

    describe('when wildcards are not present in source', () => {
      it('should match when source and target are equivalent', () => {
        const source = '{ "someOtherKey": "someOtherValue", "someKey": "someValue" }';
        const target = '{ "someKey": "someValue", "someOtherKey": "someOtherValue" }';

        expect(stringSimilarity(source, target, true)).toBe(true);
      });

      it('should not match when source and target are equivalent', () => {
        const source = '{ "someOtherKey": "someOtherValue", "someKey": "someValue" }';
        const target = '{ "someDifferentKey": "someValue", "someOtherKey": "someOtherValue" }';

        expect(stringSimilarity(source, target, true)).toBe(false);
      });
    });
  });
});
