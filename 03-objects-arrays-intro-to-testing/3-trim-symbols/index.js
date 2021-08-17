/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (!string) {
    return '';
  }

  if (size === 0) {
    return '';
  }

  if (!size || size < 0) {
    return string;
  }

  let current = string[0];
  let count = 0;
  let result = '';

  for (let symbol of string) {
    if (symbol !== current) {
      count = 1;
      result = result + symbol;
      current = symbol;
    } else if (count < size) {
      count++;
      result = result + symbol;
    }
  }

  return result;
}
