import escapeRegExp from 'lodash.escaperegexp';
import matcher from 'matcher';
import { isObject } from './helpers';

export const WILDCARD_MARKER_ESCAPED = '{{\\*}}';
export const WILDCARD_MARKER = '{{*}}';
export const UNQUOTED_WILDCARD_PLACEHOLDER = '{{%}}';

const getIsMatch = (source, target) => {
  const wildcardedSource = source
    .replace(new RegExp(escapeRegExp('*'), 'g'), '\\*')
    .replace(new RegExp(escapeRegExp(WILDCARD_MARKER_ESCAPED), 'g'), '*');

  return matcher.isMatch(target, wildcardedSource);
};

export const recursiveKeySort = (data) => {
  if (data && isObject(data)) {
    const sortedData = {};
    Object.keys(data).sort().forEach((key) => {
      sortedData[key] = recursiveKeySort(data[key]);
    });
    if (Array.isArray(data)) {
      return Object.values(sortedData);
    }
    return sortedData;
  }
  return data;
};

export const replaceWildcards = (value) => {
  let processedValue = value;
  const searchUnquotedWildcards = new RegExp(/(([^:\s,]*)\{\{\*\}\}([^,:\s}\]]*))(?=[^,:}\]\s]*)/g);
  let resultArray = searchUnquotedWildcards.exec(processedValue);

  while (resultArray !== null) {
    const matchedString = resultArray[0];
    const matchedStringIndex = searchUnquotedWildcards.lastIndex - matchedString.length;
    const isWildcardInQuotes = matchedString.startsWith('"')
      && matchedString.endsWith('"');

    if (!isWildcardInQuotes) {
      const matchWithWildcardPlaceholder = matchedString
        .replace(WILDCARD_MARKER, UNQUOTED_WILDCARD_PLACEHOLDER);
      const matchWithPlaceholderAndQuotes = '"'.concat(matchWithWildcardPlaceholder.concat('"'));
      const processedPortion = processedValue.slice(0, matchedStringIndex);
      let remainingPortion = processedValue.slice(matchedStringIndex);
      remainingPortion = remainingPortion.replace(matchedString, `${matchWithPlaceholderAndQuotes}`);
      processedValue = processedPortion + remainingPortion;
    }
    resultArray = searchUnquotedWildcards.exec(processedValue);
  }
  return processedValue;
};

export const restoreWildcards = (value) => {
  let processedValue = value;
  const searchUnquotedWildcardPlaceholders = new RegExp(/(([^:\s,]*)\{\{%\}\}([^,\s}\]]*))(?=[^,}\]\s]*)/g);
  let resultArray = searchUnquotedWildcardPlaceholders.exec(processedValue);

  while (resultArray !== null) {
    const matchedString = resultArray[0];
    const matchWithRestoredWildcard = matchedString
      .replace(UNQUOTED_WILDCARD_PLACEHOLDER, WILDCARD_MARKER);
    const restoredMatch = matchWithRestoredWildcard.substr(1, matchWithRestoredWildcard.length - 2);
    processedValue = processedValue.replace(matchedString, `${restoredMatch}`);
    resultArray = searchUnquotedWildcardPlaceholders.exec(processedValue);
  }
  return processedValue;
};

export default (source, target, shouldSortObjectKeys) => {
  if (!source || (source || '') === (target || '')) {
    return source === target;
  }

  const isMatching = getIsMatch(source, target);

  if (isMatching) {
    return true;
  }

  if (shouldSortObjectKeys && source && target) {
    try {
      let processedSource = `${source}`;
      let processedTarget = `${target}`;

      processedSource = replaceWildcards(processedSource);
      processedSource = JSON.parse(processedSource, (key, value) => {
        if (key.includes(WILDCARD_MARKER)) {
          throw new Error();
        }
        return value;
      });
      processedSource = JSON.stringify(recursiveKeySort(processedSource));
      processedSource = restoreWildcards(processedSource);

      processedTarget = JSON.parse(processedTarget);
      processedTarget = JSON.stringify(recursiveKeySort(processedTarget));

      if (source.includes('ws_loadplanning_360_offerCompositeService/create/conditional')) {
        console.log('source:', processedSource);
        console.log('target:', processedTarget);
      }

      return getIsMatch(processedSource, processedTarget);
    } catch (e) {
      return false;
    }
  }

  return false;
};
