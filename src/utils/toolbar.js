import { isMap } from "./common";

/**
 * This function displays the icon for the first available option in a dropdown placeholder.
 */
export const getFirstIcon = config => config[config.options[0]].icon;

/**
 * The function is used to recursively merge toolbar options.
 * It assumes all the options are present in obj1.
 * It recursively merges objects but not arrays.
 */
export const mergeRecursive = (obj1, obj2) => {
  if (obj1 && obj2 === undefined) {
    return obj1;
  }
  const mergedValue = {};
  Object.keys(obj1).forEach((key) => {
    const value = obj1[key];
    if (isMap(value)) {
      mergedValue[key] = mergeRecursive(value, obj2[key]);
    } else {
      mergedValue[key] = obj2[key] !== undefined ? obj2[key] : value;
    }
  });
  return mergedValue;
};
