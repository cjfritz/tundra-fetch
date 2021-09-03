import escapeRegExp from 'lodash.escaperegexp';
import matcher from 'matcher';
import { isObject, isString } from './helpers';

export const WILDCARD_MARKER_ESCAPED = '{{\\*}}';
export const WILDCARD_MARKER = '{{*}}';
export const UNQUOTED_WILDCARD_PLACEHOLDER = '%{{*}}%';
export const UNQUOTED_WILDCARD_PLACEHOLDER_REGEX = /"%\{\{\*\}\}%"/g;
const searchUnquotedWildcards = new RegExp(/((:[^"]*)\{\{\*\}\}([^"]*))(?=([^"]*(,|\})))/g);
const searchModifiedWildcards = new RegExp(/((:"[^"]*)(%\{\{\*\}\}%)[^,}]*)(?=[^"]*(,|\}))/g);

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
    let modifiedMatch;

    if (makeParsable) {
      modifiedMatch = matchedString
        .replace(WILDCARD_MARKER, UNQUOTED_WILDCARD_PLACEHOLDER)
        .replace(/\s/g, '')
        .split('');
      modifiedMatch.splice(1, 0, '"');
      modifiedMatch.push('"');
      modifiedMatch = modifiedMatch.join('');
    } else {
      modifiedMatch = matchedString
        .replace(UNQUOTED_WILDCARD_PLACEHOLDER, WILDCARD_MARKER)
        .split('');
      modifiedMatch.splice(1, 1);
      modifiedMatch.pop();
      modifiedMatch = modifiedMatch.join('');
    }
    processedValue = processedValue.replace(matchedString, `${modifiedMatch}`);
    resultArray = regEx.exec(processedValue);
  }
  return processedValue;
};

export default (source, target, shouldSortObjectKeys = false) => {
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
        if (isString(key) && key.includes(WILDCARD_MARKER)) {
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
