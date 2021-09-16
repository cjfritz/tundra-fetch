'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.restoreWildcards = exports.replaceWildcards = exports.recursiveKeySort = exports.UNQUOTED_WILDCARD_PLACEHOLDER = exports.WILDCARD_MARKER = exports.WILDCARD_MARKER_ESCAPED = undefined;

var _lodash = require('lodash.escaperegexp');

var _lodash2 = _interopRequireDefault(_lodash);

var _matcher = require('matcher');

var _matcher2 = _interopRequireDefault(_matcher);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var WILDCARD_MARKER_ESCAPED = exports.WILDCARD_MARKER_ESCAPED = '{{\\*}}';
var WILDCARD_MARKER = exports.WILDCARD_MARKER = '{{*}}';
var UNQUOTED_WILDCARD_PLACEHOLDER = exports.UNQUOTED_WILDCARD_PLACEHOLDER = '{{%}}';

var getIsMatch = function getIsMatch(source, target) {
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

var replaceWildcards = exports.replaceWildcards = function replaceWildcards(value) {
  var processedValue = value;
  var searchUnquotedWildcards = new RegExp(/(([^:\s,]*)\{\{\*\}\}([^,:\s}\]]*))(?=[^,:}\]\s]*)/g);
  var resultArray = searchUnquotedWildcards.exec(processedValue);

  while (resultArray !== null) {
    var matchedString = resultArray[0];
    var matchedStringIndex = searchUnquotedWildcards.lastIndex - matchedString.length;
    var isWildcardInQuotes = matchedString.startsWith('"') && matchedString.endsWith('"');

    if (!isWildcardInQuotes) {
      var matchWithWildcardPlaceholder = matchedString.replace(WILDCARD_MARKER, UNQUOTED_WILDCARD_PLACEHOLDER);
      var matchWithPlaceholderAndQuotes = '"'.concat(matchWithWildcardPlaceholder.concat('"'));
      var processedPortion = processedValue.slice(0, matchedStringIndex);
      var remainingPortion = processedValue.slice(matchedStringIndex);
      remainingPortion = remainingPortion.replace(matchedString, '' + matchWithPlaceholderAndQuotes);
      processedValue = processedPortion + remainingPortion;
    }
    resultArray = searchUnquotedWildcards.exec(processedValue);
  }
  return processedValue;
};

var restoreWildcards = exports.restoreWildcards = function restoreWildcards(value) {
  var processedValue = value;
  var searchUnquotedWildcardPlaceholders = new RegExp(/(([^:\s,]*)\{\{%\}\}([^,\s}\]]*))(?=[^,}\]\s]*)/g);
  var resultArray = searchUnquotedWildcardPlaceholders.exec(processedValue);

  while (resultArray !== null) {
    var matchedString = resultArray[0];
    var matchWithRestoredWildcard = matchedString.replace(UNQUOTED_WILDCARD_PLACEHOLDER, WILDCARD_MARKER);
    var restoredMatch = matchWithRestoredWildcard.substr(1, matchWithRestoredWildcard.length - 2);
    processedValue = processedValue.replace(matchedString, '' + restoredMatch);
    resultArray = searchUnquotedWildcardPlaceholders.exec(processedValue);
  }
  return processedValue;
};

exports.default = function (source, target, shouldSortObjectKeys) {
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

      processedSource = replaceWildcards(processedSource);
      processedSource = JSON.parse(processedSource, function (key, value) {
        if (key.includes(WILDCARD_MARKER)) {
          throw new Error();
        }
        return value;
      });
      processedSource = JSON.stringify(recursiveKeySort(processedSource));
      processedSource = restoreWildcards(processedSource);

      processedTarget = JSON.parse(processedTarget);
      processedTarget = JSON.stringify(recursiveKeySort(processedTarget));

      return getIsMatch(processedSource, processedTarget);
    } catch (e) {
      return false;
    }
  }

  return false;
};
//# sourceMappingURL=stringSimilarity.js.map