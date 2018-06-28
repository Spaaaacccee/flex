import { Role, RoleList } from "./Role";
import { Member, MemberList } from "./Member";

import { IDGen } from "./Utils";
import Fetch from "./Fetch";

/**
 * Represents a project
 * @export
 * @class Project
 */
export default class Project {
  /**
   * Check if a project is registered in the database
   * @static
   * @param  {String} projectID
   * @return {Boolean}
   * @memberof Project
   */
  static async exists(projectID) {
    return (await (await Fetch.getProjectReference(projectID)).once(
      "value"
    )).exists();
  }

  /**
   * Gets a project. Alias to `Fetch.getProject(projectID)`
   * @static
   * @param  {any} projectID
   * @return {Project}
   * @memberof Project
   */
  static async get(projectID) {
    return await Fetch.getProject(projectID);
  }

  /**
   * Updates the details of a project.
   * Creates a new project when specified projectID is not found.
   * Use this for initialising new projects.
   *
   * Warning: The remote copy of the project is replaced with the local copy regardless whether changes are made from any other locations.
   *
   * @static
   * @param  {string} projectID
   * @param  {User} project
   * @return {boolean} Whether the action was successful
   * @memberof Project
   */
  static async forceUpdate(projectID, project) {
    try {
      if (project instanceof Project) {
        project = Object.assign(await Project.get(projectID), project);
        project.lastUpdatedTimestamp = Date.now();
        (await Fetch.getProjectReference(projectID)).set(project);
        return true;
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  static async delete(projectID) {}

  /**
   * @type {String}
   * @memberof Project
   */
  projectID;

  /**
   * @type {String}
   * @memberof Project
   */
  name;

  /**
   * Uid of the project creator
   * @memberof Project
   */
  creator;

  /**
   * Uid of the project owner.
   * Unless the project has transferred ownership, the creator is the same as the owner.
   * @memberof Project
   */
  owner;

  /**
   * @type {String}
   * @memberof Project
   */
  thumbnail;

  /**
   * @type {String}
   * @memberof Project
   */
  profileImage;

  /**
   * @type {Date}
   * @memberof Project
   */
  lastUpdatedTimestamp;

  /**
   * @type {String}
   * @memberof Project
   */
  description;

  /**
   * @type {MemberList}
   * @memberof Project
   */
  members;

  /**
   * @type {RoleList}
   * @memberof Project
   */
  roles;

  /**
   * Creates an instance of Project.
   * @param  {any} name Name of the project
   * @memberof Project
   */
  constructor(name) {
    this.name = name || null;
    this.projectID = IDGen.generateUID();
    this.lastUpdatedTimestamp = Date.now();
    this.description = "No description.";
  }

  /**
   * Completes an operation on this object while syncing with the server.
   * Operation is guaranteed to be performed on the most recent version of the object.
   *
   * @param  {Function} operation The operation to perform. Use the `this` keyword to refer to this object like usual. Note: The function must be written as a function expression, and not an arrow function due to lexical `this` differences.
   * @return {Boolean} Whether the operation completed successfully
   * @memberof Project
   */
  async transaction(operation) {
    try {
      await Fetch.getProjectReference(this.projectID).transaction(item => {
        if(item) operation.apply(item);
        return item;
      });
    } catch (e) {
      console.log(e);
      throw new Error("Transaction was not able to be completed");
      return false;
    }
    operation.apply(this);
    return true;
  }

  async setName(newName) {
    await this.transaction(function() {
      this.name = newName;
    });
  }

  async setDescription(newDescription) {
    await this.transaction(function() {
      this.description = newDescription;
    });
  }

  async addRole(name) {
    await this.transaction(function() {
      this.roles.add(name);
    });
    return true;
  }

  async deleteRole(uid) {
    await this.transaction(function() {
      this.roles.remove(uid);
    });
    return true;
  }
}
