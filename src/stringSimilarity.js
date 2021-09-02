import escapeRegExp from 'lodash.escaperegexp';
import matcher from 'matcher';
import { isObject } from './helpers';

export const WILDCARD_MARKER_ESCAPED = '{{\\*}}';
export const WILDCARD_MARKER = '{{*}}';
export const UNQUOTED_MARKER_PLACEHOLDER = '"%{{*}}%"';
export const UNQUOTED_MARKER_PLACEHOLDER_REGEX = /"%\{\{\*\}\}%"/g;

export const getIsMatch = (source, target) => {
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
