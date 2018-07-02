import Fetch from "./Fetch";
import Fire from "./Fire";
import Project from "./Project";
import Role from "./Role";
import Member from "./Member";

/**
 * Represents a single user
 * @export
 * @class User
 */
export default class User {
  /**
   * Gets the user that is signed in.
   * @static
   * @return 
   * @memberof User
   */
  static async getCurrentUser() {
    return User.get(Fire.firebase().auth().currentUser.uid);
  }

  /**
   * Returns whether a user exists
   * @static
   * @param  {String} userID 
   * @return 
   * @memberof User
   */
  static async exists(userID) {
    return (await (await Fetch.getUserReference(userID)).once(
      "value"
    )).exists();
  }

  /**
   * Gets a user
   * @static
   * @param  {any} userID 
   * @return 
   * @memberof User
   */
  static async get(userID) {
    return await Fetch.getUser(userID);
  }

  /**
   * Updates the details of a user.
   * Creates a new user when specified userID is not found.
   * Use this for initialising new users.
   *
   * Warning: The remote copy of the user is replaced with the local copy regardless whether changes are made from any other locations.
   *
   * @static
   * @param  {string} userID
   * @param  {User} user
   * @return {boolean} Whether the action was successful
   * @memberof User
   */
  static async forceUpdate(userID, user) {
    try {
      // Merge the existing user with the new. If no existing user is found then an empty object will be used.
      user = Object.assign((await User.get(userID)) || {}, user);
      // Set the last updated timestamp to now.
      user.lastUpdatedTimestamp = Date.now();
      (await Fetch.getUserReference(userID)).set(user);
      // Return true to signify that the operation was successful.
      return true;
    } catch (e) {
      // Catch any errors that may show up from the request.
      console.log(e);
      return false;
    }
  }

  /**
   * Deletes a user
   * @static
   * @param  {any} userID
   * @return {boolean} whether the action was successful
   * @memberof User
   */
  static async delete(userID) {
    try {
      await Fetch.getUserReference(userID).set({});
      return true;
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  /**
   * The unique id of this user. This should match the uid of the user in authentication.
   * @type {String}
   * @memberof User
   */
  uid;
  /**
   * The display name of the user
   * @type {String}
   * @memberof User
   */
  name;
  /**
   * The email address of the user
   * @type {String}
   * @memberof User
   */
  email;
  /**
   * A URL to the profile image of the user
   * @type {String}
   * @memberof User
   */
  profilePhoto;
  /**
   * @type {Number}
   * @memberof User
   */
  lastUpdatedTimestamp;
    /**
   * @type {Number}
   * @memberof User
   */
  lastLogInTimestamp;
  /**
   * All projects that the user created
   * @memberof User
   */
  projects = [];
  /**
   * A projects that the user has joined
   * @memberof User
   */
  joinedProjects = [];

  /**
   * Add a new project to this user
   * @param  {Project} project
   * @return {Promise<Boolean>}
   * @memberof User
   */
  async newProject(project) {
    try {
      // Continue only if `project` is of type `Project`
      if (project instanceof Project) {
        // Set the owner of the project to this user
        project.creator = this.uid;
        project.owner = this.uid;
        // Update the database with this project
        await Project.forceUpdate(project.projectID, project);
        this.projects.push(project.projectID);
        // Update the database with this user
        await User.forceUpdate(this.uid, this);
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  }
  /**
   * Creates an instance of User.
   * @param  {String} uid 
   * @memberof User
   */
  constructor(uid) {
    this.uid = uid || null;
    this.lastUpdatedTimestamp = Date.now();
  }
}
