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
   * Creates an instance of Member.
   * @param  {String} uid
   * @param  {RoleList} roles
   * @memberof Member
   */
  constructor(uid, roles) {
    this.uid = uid;
    this.roles = roles;
  }
}

export class MemberList extends Array {}
