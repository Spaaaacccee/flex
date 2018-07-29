import ee from "event-emitter";
export class EventEmitter {
  constructor() {
    ee(EventEmitter.prototype);
  }
}

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
   * Returns whether an item exists in an array
   * @static
   * @param  {any} array
   * @param  {any} item
   * @return {Boolean}
   * @memberof ArrayUtils
   */
  static exists(array, item) {
    return array.indexOf(item) !== -1;
  }
  /**
   * Removes a predetermined item
   * @static
   * @param  {any} array
   * @param  {any} item
   * @return {Array} Resulting array
   * @memberof ArrayUtils
   */
  static remove(array, item) {
    if (ArrayUtils.exists(array, item)) {
      array.splice(array.indexOf(item), 1);
      return array;
    }
  }

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

  /**
   * Selects all items in an array that matches a condition
   * @static
   * @param  {any} array
   * @param  {Function<Object,Number>} condition
   * @return {Array}
   * @memberof ArrayUtils
   */
  static where(array, condition) {
    let newArray = [];
    array.forEach((element, index) => {
      if (condition(element, index)) {
        newArray.push(element);
      }
    });
    return newArray;
  }

  /**
   * Applies a predicate onto each element of an array and returns the array
   * @static
   * @param  {Array} array
   * @param  {Function<Object,Number>} predicate
   * @return
   * @memberof ArrayUtils
   */
  static select(array, predicate) {
    let newArray = [];
    array.forEach((element, index) => {
      newArray.push(predicate(element, index));
    });
    return newArray;
  }

  /**
   * Returns the index of the first instance of an element that fulfills a condition
   * @static
   * @param  {Array} array
   * @param  {Function<Object>} condition
   * @return {Numer}
   * @memberof ArrayUtils
   */
  static indexOf(array, condition) {
    let i = -1;
    array.forEach((element, index) => {
      if (condition(element)) i = index;
    });
    return i;
  }

  static searchString(array, getString, value) {
    return array.filter(
      item => getString(item).includes(value.toLowerCase()) !== false
    );
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
        } else {
          /*
        else if (Array.isArray(source[key]) && Array.isArray(target[key])) {
          Object.assign(target, { [key]: target[key].concat(source[key]) });
        } 
        */
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return ObjectUtils.mergeDeep(target, ...sources);
  }
}
