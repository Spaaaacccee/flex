import Moment from "moment";
import CryptoJS from "crypto-js";

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
    if (action && eventName) {
      this.all[eventName] = this.all[eventName].filter(item => item !== action);
    } else {
      if (eventName) this.all[eventName] = [];
      else this.all = {};
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

class IDGen {
  UIDlength = 28;
  UIDChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
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

  checkSumLength = 4;
  /**
   * Generates a checksum from a string
   * @param  {String} str
   * @return {void}
   * @memberof IDGen
   */
  checkSum(target, str) {
    return ("" + parseInt(CryptoJS.SHA1(str).toString(), 16))
      .replace(".", "")
      .substring(0, this.checkSumLength);
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

class DateUtils {
  relativeTimeThreshold = 1000 * 60 * 60;
  humanise(date, pastOnly) {
    if (pastOnly) date = Math.min(date, Date.now());
    let moment = new Moment(date);
    let datenow = Date.now();
    return (datenow - date > this.relativeTimeThreshold
      ? moment.calendar()
      : moment.fromNow()
    ).toLowerCase();
  }
  humaniseDate(date) {
    let moment = new Moment(date);
    return moment
      .calendar(null, {
        sameDay: "[Today]",
        nextDay: "[Tomorrow]",
        nextWeek: "[Upcoming] dddd",
        lastDay: "[Yesterday]",
        lastWeek: "[Last] dddd",
        sameElse: "DD/MM/YYYY"
      })
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
    return (array || []).filter(x => x !== item);
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
      item =>
        getString(item)
          .toLowerCase()
          .includes(value.toLowerCase()) !== false
    );
  }
}

class StringUtils {
  trimLeft(string) {
    return string.replace(/^\s+/, "");
  }
  isVowel(char) {
    return ["a", "e", "i", "o", "u"].indexOf(char.toLowerCase()) !== -1;
  }
  capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
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
   * @property {()=>boolean} isObject
   * @property {()=>array} values
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
   * @property {(char:string)=>boolean} isVowel
   * @property {(string:string)=>string} capitaliseFirstLetter
   */

  /**
   * Utilities for manipulating strings
   * @type {(target:string)=>stringUtils}
   * @memberof $
   */
  string = this.make(new StringUtils());

  /**
   * @typedef dateUtils
   * @type {Object}
   * @property {()=>String} humanise
   * @property {()=>String} humaniseDate
   */

  /**
   * Utilities for dealing with time
   * @type {(target:Number|Date)=>dateUtils}
   * @memberof $
   */
  date = this.make(new DateUtils());

  /**
   * @typedef idGen
   * @property {()=>string} generateUID
   * @property {(string)=>string} checkSum
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
