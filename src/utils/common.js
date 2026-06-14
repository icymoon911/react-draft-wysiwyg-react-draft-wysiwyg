/**
 * Check if an object has a specific own property.
 */
export function hasProperty(obj, property) {
  if (!obj) return false;
  return Object.prototype.hasOwnProperty.call(obj, property);
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
 * The function will filter out props from object and return new props.
 * Returns a new object with keys NOT present in the `keys` array.
 */
export function filter(obj, keys) {
  const filteredKeys = Object.keys(obj).filter(key => keys.indexOf(key) < 0);
  const filteredObject = {};
  filteredKeys.forEach((key) => {
    filteredObject[key] = obj[key];
  });
  return filteredObject;
}

export function stopPropagation(event) {
  event.stopPropagation();
}
