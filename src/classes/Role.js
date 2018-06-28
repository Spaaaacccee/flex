import { IDGen, ArrayUtils } from "./Utils";
import Fetch from "./Fetch";

export default class Role {
  /**
   * @type {String}
   * @memberof Role
   */
  uid;
  /**
   * @type {String}
   * @memberof Role
   */
  name;
  /**
   * Creates an instance of Role.
   * @param  {String} name
   * @memberof Role
   */
  constructor(name) {
    this.uid = IDGen.generateUID();
    this.name = name;
  }
}

export class RoleList extends Array {
  constructor() {
    super();
  }
  add(name) {
    this.push(new Role(name));
  }
  remove(uid) {
    ArrayUtils.removeIf(this, (item, index) => item.uid && item.uid === uid);
  }
}
