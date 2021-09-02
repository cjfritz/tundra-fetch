'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (fetchParams) {
  var singleParameter = fetchParams && fetchParams.length === 1;
  var undefinedSecondParameter = fetchParams && fetchParams.length === 2 && fetchParams[1] === undefined;

  if (singleParameter || undefinedSecondParameter) {
    // Scenario: fetch('url')
    if ((0, _helpers.isString)(fetchParams[0])) {
      return {
        url: fetchParams[0],
        config: {
          method: 'GET'
        }
      };
    }
    // Scenario: fetch({ url: 'url', method: 'GET' })
    if ((0, _helpers.isObject)(fetchParams[0])) {
      return {
        url: fetchParams[0].url,
        config: fetchParams[0]
      };
    }
  }

  if (fetchParams && fetchParams.length === 2) {
    // Scenario: fetch('url', { method: 'GET' })
    if ((0, _helpers.isString)(fetchParams[0]) && (0, _helpers.isObject)(fetchParams[1])) {
      return {
        url: fetchParams[0],
        config: fetchParams[1]
      };
    }
  }

  throw Error('Unknown fetch argument configuration: ' + fetchParams);
};

var _helpers = require('./helpers');

//# sourceMappingURL=fetchArgumentExtractor.js.map