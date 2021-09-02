'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.recursiveKeySort = exports.getIsMatch = exports.UNQUOTED_MARKER_PLACEHOLDER_REGEX = exports.UNQUOTED_MARKER_PLACEHOLDER = exports.WILDCARD_MARKER = exports.WILDCARD_MARKER_ESCAPED = undefined;

var _lodash = require('lodash.escaperegexp');

var _lodash2 = _interopRequireDefault(_lodash);

var _matcher = require('matcher');

var _matcher2 = _interopRequireDefault(_matcher);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WILDCARD_MARKER_ESCAPED = exports.WILDCARD_MARKER_ESCAPED = '{{\\*}}';
var WILDCARD_MARKER = exports.WILDCARD_MARKER = '{{*}}';
var UNQUOTED_MARKER_PLACEHOLDER = exports.UNQUOTED_MARKER_PLACEHOLDER = '"%{{*}}%"';
var UNQUOTED_MARKER_PLACEHOLDER_REGEX = exports.UNQUOTED_MARKER_PLACEHOLDER_REGEX = /"%\{\{\*\}\}%"/g;

var getIsMatch = exports.getIsMatch = function getIsMatch(source, target) {
  var wildcardedSource = source.replace(new RegExp((0, _lodash2.default)('*'), 'g'), '\\*').replace(new RegExp((0, _lodash2.default)(WILDCARD_MARKER_ESCAPED), 'g'), '*');

  return _matcher2.default.isMatch(target, wildcardedSource);
};

var recursiveKeySort = exports.recursiveKeySort = function recursiveKeySort(data) {
  if (data && (0, _helpers.isObject)(data)) {
    var sortedData = {};
    Object.keys(data).sort().forEach(function (key) {
      sortedData[key] = recursiveKeySort(data[key]);
    });
    if (Array.isArray(data)) {
      return Object.values(sortedData);
    }
    return sortedData;
  }
  return data;
};

exports.default = function (source, target) {
  var shouldSortObjectKeys = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  if (!source || (source || '') === (target || '')) {
    return source === target;
  }

  var isMatching = getIsMatch(source, target);

  if (isMatching) {
    return true;
  }

  if (shouldSortObjectKeys && source && target) {
    try {
      var processedSource = '' + source;
      var processedTarget = '' + target;

      processedSource = processedSource.replace(/\{\{\*\}\}(?!")/g, UNQUOTED_MARKER_PLACEHOLDER);

      processedSource = JSON.parse(processedSource);
      processedTarget = JSON.parse(processedTarget);

      processedSource = JSON.stringify(recursiveKeySort(processedSource));
      processedTarget = JSON.stringify(recursiveKeySort(processedTarget));

      processedSource = processedSource.replace(UNQUOTED_MARKER_PLACEHOLDER_REGEX, WILDCARD_MARKER);
      processedTarget = processedTarget.replace(UNQUOTED_MARKER_PLACEHOLDER_REGEX, WILDCARD_MARKER);

      return getIsMatch(processedSource, processedTarget);
    } catch (e) {
      return false;
    }
  }
};

//# sourceMappingURL=stringSimilarity.js.map