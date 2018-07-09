import { IDGen } from "./Utils";
import Fetch from "./Fetch";
import { RoleList } from "./Role";

/**
 * Represents a member of a project
 * @export
 * @class Member
 */
export default class Member {
  /**
   * The unique id of the user
   * @type {String}
   * @memberof Member
   */
  uid;
  /**
   * The roles this member should take on
   * @type {RoleList}
   * @memberof Member
   */
  roles;
  /**
   * The date that this member joined
   * @type {Date}
   * @memberof Member
   */
  joined;
  /**
   * Creates an instance of Member.
   * @param  {String} uid
   * @param  {RoleList} roles
   * @param {Boolean} justJoined Whether to set the `joined` date to now
   * @memberof Member
   */
  constructor(uid, roles, justJoined) {
    this.uid = uid;
    this.roles = roles;
    justJoined?this.joined = Date.now():false;
  }
}

export class MemberList extends Array {}
