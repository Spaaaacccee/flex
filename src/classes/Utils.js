/**
 * Utilities for generating IDs and random values
 * @export
 * @class IDGen
 */
export class IDGen {
  static UIDlength = 28;
  static UIDChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  /**
   * Generates a random ID
   * @static
   * @return 
   * @memberof IDGen
   */
  static generateUID() {
    let uid = "";
    for (var i = 0; i < this.UIDlength; i++)
      uid += this.UIDChars.charAt(
        Math.floor(Math.random() * this.UIDChars.length)
      );
    return uid;
  }
  /**
   * Generates a random integer between values (inclusive)
   * @static
   * @param  {Number} min 
   * @param  {Number} max 
   * @return 
   * @memberof IDGen
   */
  static generateInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

export class ArrayUtils {
  /**
   * Removes all instances in an array that match a condition
   * @static
   * @param  {Array} array
   * @param  {Function<Object,Number>} condition
   * @return {Array}
   * @memberof ArrayUtils
   */
  static removeIf(array, condition) {
    var i = array.length;
    while (i--) {
      if (condition(array[i], i)) {
        array.splice(i, 1);
      }
    }
    return array;
  }
}

export class ObjectUtils {
  /**
   * Simple object check.
   * @param item
   * @returns {boolean}
   */
  static isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  /**
   * Deep merge two objects.
   * Courtesy of Salakar & Rubens Mariuzzo
   *
   * https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
   *
   * @param target
   * @param sources
   */
  static mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (ObjectUtils.isObject(target) && ObjectUtils.isObject(source)) {
      for (const key in source) {
        if (ObjectUtils.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          ObjectUtils.mergeDeep(target[key], source[key]);
        } 
        /*
        else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
          Object.assign(target, { [key]: target[key].concat(source[key]) });
        } 
        */
        else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return ObjectUtils.mergeDeep(target, ...sources);
  }
}
