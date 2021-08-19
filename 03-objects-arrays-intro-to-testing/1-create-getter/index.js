/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {

  const pathParts = path.split('.');

  return function (product) {
    let result = pathParts.length ? product : null;

    for (let item of pathParts) {
      if (!(item in result)) {
        return;
      }
      result = result[item];
    }
    return result;
  };
}
