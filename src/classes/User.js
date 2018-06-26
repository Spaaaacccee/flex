import Fetch from "./Fetch";
import Fire from "./Fire";
import Project from "./Project";

export default class User {

  static async getCurrentUser() {
      return User.get(Fire.firebase().auth().currentUser.uid);
  }

  static async exists(userID) {
    return (await (await Fetch.getUserReference(userID)).once('value')).exists();
  }

  static async get(userID) {
      return await Fetch.getUser(userID);
  }
  /**
   * Updates the details of a user. Creates a new user when specified userID is not found.
   * @static
   * @param  {string} userID
   * @param  {User} user
   * @return {boolean} whether the action was successful
   * @memberof User
   */
  static async update(userID, user) {
    try {
      if (user instanceof User) {
        user = Object.assign((await User.get(userID)),user);
        user.lastUpdatedTimestamp = Date.now();
        (await Fetch.getUserReference(userID)).set(user);
        return true;
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  /**
   * deletes a user
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

  uid;
  lastUpdatedTimestamp;
  lastLogInTimestamp;
  projects = [];
  joinedProjects = [];

  /**
   * Add a new project to this user
   * @param  {Project} project
   * @return {Promise<Boolean>}
   * @memberof User
   */
  async newProject(project) {
    try {
      if (project instanceof Project) {
        await Project.update(project.projectID, project);
        this.projects.push(project.projectID);
        await User.update(this.uid, this);
      }
    } catch (e) {
      console.log(e);
    }
    return false;
  }

  constructor(uid) {
    this.uid = uid || null;
    this.lastUpdatedTimestamp = Date.now();
  }
}
