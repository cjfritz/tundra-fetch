import escapeRegExp from 'lodash.escaperegexp';
import matcher from 'matcher';
import { isObject } from './helpers';

export const WILDCARD_MARKER_ESCAPED = '{{\\*}}';
export const WILDCARD_MARKER = '{{*}}';
export const UNQUOTED_WILDCARD_PLACEHOLDER = '{{%}}';
const searchUnquotedWildcards = new RegExp(/(([^:\s,]*)\{\{\*\}\}([^,:\s}\]]*))(?=[^,:}\]\s]*)/g);
const searchModifiedWildcards = new RegExp(/(([^:\s,]*)\{\{%\}\}([^,\s}\]]*))(?=[^,}\]\s]*)/g);

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

export const replaceWildcards = (value, makeParsable) => {
  let processedValue = value;
  const regEx = makeParsable ? searchUnquotedWildcards : searchModifiedWildcards;
  let resultArray = regEx.exec(processedValue);

  while (resultArray !== null) {
    const matchedString = resultArray[0];
    const matchedStringIndex = regEx.lastIndex - matchedString.length;
    let modifiedMatch;

    if (makeParsable) {
      const isWildcardInString = matchedString.startsWith('"')
        && matchedString.endsWith('"');

      if (!isWildcardInString) {
        modifiedMatch = matchedString
          .replace(WILDCARD_MARKER, UNQUOTED_WILDCARD_PLACEHOLDER)
          .split('');
        modifiedMatch.splice(0, 0, '"');
        modifiedMatch.push('"');
        modifiedMatch = modifiedMatch.join('');
        const processedPortion = processedValue.slice(0, matchedStringIndex);
        let remainingPortion = processedValue.slice(matchedStringIndex);
        remainingPortion = remainingPortion.replace(matchedString, `${modifiedMatch}`);
        processedValue = processedPortion + remainingPortion;
      }
    } else {
      modifiedMatch = matchedString
        .replace(UNQUOTED_WILDCARD_PLACEHOLDER, WILDCARD_MARKER)
        .split('');
      modifiedMatch.splice(0, 1);
      modifiedMatch.pop();
      modifiedMatch = modifiedMatch.join('');
      processedValue = processedValue.replace(matchedString, `${modifiedMatch}`);
    }
    resultArray = regEx.exec(processedValue);
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

      processedSource = replaceWildcards(processedSource, true);
      processedSource = JSON.parse(processedSource, (key, value) => {
        if (key.includes(WILDCARD_MARKER)) {
          throw new Error();
        }
        return value;
      });
      processedSource = JSON.stringify(recursiveKeySort(processedSource));
      processedSource = replaceWildcards(processedSource);

      processedTarget = JSON.parse(processedTarget);
      processedTarget = JSON.stringify(recursiveKeySort(processedTarget));

      return getIsMatch(processedSource, processedTarget);
    } catch (e) {
      return false;
    }
  }

  return false;
};
