/**
 * Class for implementing event functionality in classes
 * @export
 * @class EventEmitter
 */
export class EventEmitter {
  all = {};
  /**
   * Registers an event handler
   * @param  {any} eventName
   * @param  {any} action
   * @return {void}
   * @memberof EventEmitter
   */
  on(eventName, action) {
    this.all[eventName] = this.all[eventName] || [];
    this.all[eventName].push(action);
  }
  /**
   * Removes an event handler
   * @param  {any} eventName
   * @param  {any} action
   * @return {void}
   * @memberof EventEmitter
   */
  off(eventName, action) {
    this.all[eventName] = this.all[eventName] || [];
    if (action) {
      this.all[eventName] = this.all[eventName].filter(item => item !== action);
    } else {
      this.all[eventName] = [];
    }
  }

  /**
   * Triggers an event
   * @param  {any} eventName
   * @param  {any} e
   * @return {void}
   * @memberof EventEmitter
   */
  emit(eventName, e) {
    this.all[eventName] = this.all[eventName] || [];
    this.all[eventName].forEach(element => {
      element(e);
    });
  }
}

/**
 * Utilities for generating IDs and random values
 * @export
 * @class IDGen
 */
class IDGen {
  static UIDlength = 28;
  static UIDChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  /**
   * Generates a random ID

   * @return
   * @memberof IDGen
   */
  generateUID(target) {
    let uid = "";
    for (var i = 0; i < this.UIDlength; i++)
      uid += this.UIDChars.charAt(
        Math.floor(Math.random() * this.UIDChars.length)
      );
    return uid;
  }
  /**
   * Generates a random integer between values (inclusive)

   * @param  {Number} min
   * @param  {Number} max
   * @return
   * @memberof IDGen
   */
  generateInt(target, min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

class ArrayUtils {
  /**
   * Returns whether an item exists in an array

   * @param  {any} array
   * @param  {any} item
   * @return {Boolean}
   * @memberof ArrayUtils
   */
  exists(array, item) {
    return array.indexOf(item) !== -1;
  }

  existsIf(array, predicate) {
    return this.indexOf(array, predicate) !== -1;
  }

  /**
   * Removes a predetermined item

   * @param  {any} array
   * @param  {any} item
   * @return {Array} Resulting array
   * @memberof ArrayUtils
   */
  remove(array, item) {
    if (this.exists(array, item)) {
      array.splice(array.indexOf(item), 1);
      return array;
    }
  }

  /**
   * Removes all instances in an array that match a condition

   * @param  {Array} array
   * @param  {Function<Object,Number>} condition
   * @return {Array}
   * @memberof ArrayUtils
   */
  removeIf(array, condition) {
    var i = array.length;
    while (i--) {
      if (condition(array[i], i)) {
        array.splice(i, 1);
      }
    }
    return array;
  }

  /**
   * Returns the index of the first instance of an element that fulfills a condition

   * @param  {Array} array
   * @param  {Function<Object>} condition
   * @return {Numer}
   * @memberof ArrayUtils
   */
  indexOf(array, condition) {
    let i = -1;
    array.forEach((element, index) => {
      if (condition(element)) i = index;
    });
    return i;
  }

  searchString(array, getString, value) {
    return array.filter(
      item => getString(item).includes(value.toLowerCase()) !== false
    );
  }
}

class StringUtils {
  trimLeft(string) {
    return string.replace(/^\s+/, "");
  }
}

class ObjectUtils {
  /**
   * Simple object check.
   * @param item
   * @returns {boolean}
   */
  isObject(item) {
    return item && typeof item === "object" && !Array.isArray(item);
  }

  values(item) {
    return Object.keys(item).map(key => item[key]);
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
  mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (this.isObject(target) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!target[key]) Object.assign(target, { [key]: {} });
          this.mergeDeep(target[key], source[key]);
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

    return this.mergeDeep(target, ...sources);
  }
}

class $ {
  /**
   * @typedef arrayUtils
   * @type {Object}
   * @property {(item)=>boolean} exists - Checks if an item exists in this array.
   * @property {(condition:(item)=>boolean)=>boolean} existsIf - Checks if any item matches a condition in this array.
   * @property {(item)=>array} remove - Removes an item from this array.
   * @property {(predicate:(item)=>boolean)=>array} removeIf - Removes any items that match a condition from this array.
   * @property {(condition:(item)=>boolean)=>number} indexOf - Gets the index of the first item that matches the condition in this array.
   * @property {(getString:(item)=>string,query: string)=>array} searchString - Gets all items in this array that matches a search string.
   */

  /**
   * Utilities for manipulating arrays.
   * @type {(target:array)=>arrayUtils}
   * @memberof
   */
  array = this.make(new ArrayUtils());

  /**
   * @typedef objectUtils
   * @type {Object}
   * @property {(item)=>boolean} isObject
   * @property {(item)=>array} values
   * @property {(...sources)=>object} mergeDeep
   */

  /**
   * Utilities for manipulating objects
   * @type {(target)=>objectUtils}
   * @memberof
   */
  object = this.make(new ObjectUtils());

  /**
   * @typedef stringUtils
   * @type {Object}
   * @property {(str:string)=>string} trimLeft
   */

  /**
   * Utilities for manipulating strings
   * @type {(target:string)=>stringUtils}
   * @memberof $
   */
  string = this.make(new StringUtils());

  /**
   * @typedef idGen
   * @property {()=>string} generateUID
   * @property {(min:number,max:number)=>number} generateInt
   */

  /**
   * Utilities for generating IDs
   * @type {()=>idGen}
   * @memberof $
   */
  id = this.make(new IDGen());

  /**
   * Create a utility set
   * @param  {Object} obj
   * @return {(target)=>({})}
   * @memberof
   */
  make(obj) {
    let currentTarget;
    return Object.assign(newTarget => {
      currentTarget = newTarget;
      return Object.getOwnPropertyNames(obj.__proto__).reduce(
        (accumulation, nextKey) =>
          Object.assign(
            accumulation,
            typeof obj[nextKey] === "function" && nextKey !== "constructor"
              ? {
                  [nextKey]: (...params) =>
                    obj[nextKey](currentTarget, ...params)
                }
              : {}
          ),
        {}
      );
    });
  }
}

export default new $();
