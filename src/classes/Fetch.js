import Project from "./Project";
import User from "./User";

import Fire from "./Fire";
import Firebase from "firebase";

const projects = [
  new Project("Example Project"),
  new Project("Another Project"),
  new Project("3rd Project")
];

export default class Fetch {
  static allProjects() {
    //return projects;
  }
  /**
   * Get a project document reference using projectID
   * @static
   * @param {string} id projectID
   * @return {Firebase.database.Reference} The reference to the project document
   * @memberof Fetch
   */
  static getProjectReference(id) {
    return Fire.firebase()
      .database()
      .ref("projects/" + id);
  }

  /**
   * Get a user document reference using user ID
   * @static
   * @param {string} id uid
   * @return {Firebase.database.Reference} The reference to the user document
   * @memberof Fetch
   */
  static getUserReference(id) {
    return Fire.firebase()
      .database()
      .ref("users/" + id);
  }

  /**
   *
   * @static
   * @param  {Firebase.database.Reference} reference
   * @param  {Function} targetType
   * @return {Object}
   * @memberof Fetch
   */
  static async getObject(reference, targetType) {
    let target = new targetType();
    Object.assign(
      target,
      (await LocalCache.persist(reference.toString()))
    );
    return target;
  }

  /**
   * Gets an actual project using ID
   * @static
   * @param  {any} id
   * @return {Project} The project object
   * @memberof Fetch
   */
  static async getProject(id) {
    return await Fetch.getObject(await Fetch.getProjectReference(id), Project);
  }
  /**
   * Gets an actual user using ID
   * @static
   * @param  {any} id
   * @return {User} The user object
   * @memberof Fetch
   */
  static async getUser(id) {
    return await Fetch.getObject(await Fetch.getUserReference(id), User);
  }
}

class LocalCache {
  static cache = {};
  static pendingUpdates = {};

  static set(request, response) {
    LocalCache.cache[JSON.stringify(request)] = response;
  }
  static get(request) {
    return LocalCache.cache[JSON.stringify(request)];
  }

  static async persist(reqURL) {
    let fetchAndUpdate = async () => {
      if(LocalCache.pendingUpdates[reqURL] && LocalCache.get(reqURL)) {
        console.warn(`Ignoring fetch request for ${reqURL} because there's a request for the same URL that has not yet been fulfilled.`);
        return LocalCache.get(reqURL);
      }
      LocalCache.pendingUpdates[reqURL] = true;
      console.info(`Getting item ${reqURL}`);
      let freshItem = (await Fire.firebase()
        .database()
        .refFromURL(reqURL)
        .once("value")).val();
        LocalCache.set(reqURL, freshItem);
        LocalCache.pendingUpdates[reqURL] = false;
        console.info(`Got item ${reqURL}`);
        return freshItem;
    };
    let cachedItem = LocalCache.get(reqURL);
    if(cachedItem) {
      fetchAndUpdate();
      return cachedItem;
    } else {
      return fetchAndUpdate();
    }
  }
}
