/**
 * Utility function to execute callback for each key->value pair.
 */
export function forEach(obj, callback) {
  if (obj) {
    Object.keys(obj).forEach((key) => {
      callback(key, obj[key]);
    });
  }
}

export function hasProperty(obj, property) {
  if (obj) {
    return Object.prototype.hasOwnProperty.call(obj, property);
  }
  return false;
}

/**
 * The function returns true if the string passed to it has no content.
 */
export function isEmptyString(str) {
  return !str || !str.trim();
}

/**
 * The function will return true for simple javascript object,
 * which is not any other built in type like Array.
 */
export function isMap(obj) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * The function will filter out props from and return new props.
 */
export function filter(obj, keys) {
  const filteredKeys = Object.keys(obj).filter((key) => keys.indexOf(key) < 0);
  const filteredObject = {};
  filteredKeys.forEach((key) => {
    filteredObject[key] = obj[key];
  });
  return filteredObject;
}

export function stopPropagation(event) {
  event.stopPropagation();
}
