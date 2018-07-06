import Role from "./Role";
import { RoleList } from "./Role";
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
   * @return {Promise<Project>}
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
      // Merge the old project with the new. If no old project is found then an empty object will be used.
      project = Object.assign((await Project.get(projectID)) || {}, project);
      // Set the last updated timestamp to now.
      project.lastUpdatedTimestamp = Date.now();
      // Set the resulting project
      (await Fetch.getProjectReference(projectID)).set(project);
      // Return true to signify that the operation was successful.
      return true;
    } catch (e) {
      // Catch any errors that may show up from the request.
      console.log(e);
      return false;
    }
  }

  /**
   * Deletes a project
   * @static
   * @param  {any} projectID The project to delete
   * @return {void}
   * @memberof Project
   */
  static async delete(projectID) {
    try {
      await Fetch.getProjectReference(projectID).set({});
      return true;
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  /**
   * The unique id of the project
   * @type {String}
   * @memberof Project
   */
  projectID;

  /**
   * A user-friendly display name for the project
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
   * A URL to the thumbnail of the project
   * @type {String}
   * @memberof Project
   */
  thumbnail;

  /**
   * A URL to the profile image of the project
   * @type {String}
   * @memberof Project
   */
  profileImage;

  /**
   * The last time this project was updated
   * @type {Date}
   * @memberof Project
   */
  lastUpdatedTimestamp;

  /**
   * A description of this project
   * @type {String}
   * @memberof Project
   */
  description;

  /**
   * The members of the project
   * @type {MemberList}
   * @memberof Project
   */
  members;

  /**
   * The roles of the project
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
    let dateNow = Date.now();
    try {
      // Perform the operation on the database object
      await Fetch.getProjectReference(this.projectID).transaction(item => {
        if (item) {
          operation.apply(item);
          item.lastUpdatedTimestamp = dateNow;
        }
        return item;
      });
    } catch (e) {
      // Catch any problems with the database request and throw an error.
      console.log(e);
      throw new Error("Transaction was not able to be completed");
    }
    // Perform the same operation on the local object
    operation.apply(this);
    this.lastUpdatedTimestamp = dateNow;
    // Return true to signify the operation was successful.
    return true;
  }

  // Set the name of this project, both locally and in the database
  async setName(newName) {
    await this.transaction(function() {
      this.name = newName;
    });
  }
  // Set the description of this project, both locally and in the database
  async setDescription(newDescription) {
    await this.transaction(function() {
      this.description = newDescription;
    });
  }

  /**
   * Immediately set all roles of this project
   * @param  {Role[]} roles
   * @return {void}
   * @memberof Project
   */
  async setRoles(roles) {
    await this.transaction(function() {
      this.roles = roles;
    });
  }

  async setMembers(members) {
    await this.transaction(function() {
      this.members = members;
    });
  }
}
