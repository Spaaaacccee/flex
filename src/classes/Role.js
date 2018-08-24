import $ from "./Utils";
import Fetch from "./Fetch";

export default class Role {
  /**
   * The unique id of this role
   * @type {String}
   * @memberof Role
   */
  uid;
  /**
   * The user-friendly name of this role
   * @type {String}
   * @memberof Role
   */
  name;
  /**
   * The color of this role, in HSL format
   * @type {HSL}
   * @memberof Role
   */
  color;
  /**
   * Creates an instance of Role.
   * @param  {String} name
   * @memberof Role
   */
  constructor(name) {
    this.uid = $.id().generateUID();
    this.name = name;
    // Generate a random colour for this role
    this.color = new HSL($.id().generateInt(0, 360), 80, 50);
  }
}

/**
 * A list of roles.
 * @export
 * @class RoleList
 * @extends Array
 */
export class RoleList extends Array {
  /**
   * Adds an item to the list
   * @param  {String} name The name of the item
   * @return {void}
   * @memberof RoleList
   */
  add(name) {
    this.push(new Role(name));
  }
  /**
   * Removes an item from the list
   * @param  {String} uid The uid of the item to remove
   * @return {void}
   * @memberof RoleList
   */
  remove(uid) {
    $.array(this).removeIf((item, index) => item.uid && item.uid === uid);
  }
}

/**
 * Represents an HSL colour
 * @class HSL
 */
export class HSL {
  h;
  s;
  l;
  /**
   * Creates an instance of HSL colour.
   * @param  {number} h 0 (red) to 360 (red)
   * @param  {number} s 0 to 100
   * @param  {number} l 0 to 100
   * @memberof HSL
   */
  constructor(h, s, l) {
    this.h = h;
    this.s = s;
    this.l = l;
  }

  /**
   * A utility to convert an HSL colour to a CSS colour string
   * @static
   * @param  {HSL} item 
   * @return 
   * @memberof HSL
   */
  static toCSSColour(item) {
    return `hsl(${item.h},${item.s}%,${item.l}%)`;
  }
}
