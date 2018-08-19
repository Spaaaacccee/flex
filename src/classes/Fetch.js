import Project from "./Project";
import User from "./User";
import Fire from "./Fire";
import Messages from "./Messages";

/**
 * Utilities for getting data from the database
 * @export
 * @class Fetch
 */
export default class Fetch {
  /**
   * Get a collection document reference using collection ID
   * @static
   * @param  {String} id
   * @return {Firebase.database.Reference} The reference to the collection document
   * @memberof Fetch
   */
  static getMessagesReference(id) {
    return Fire.firebase()
      .database()
      .ref("messages/" + (id || ""));
  }

  /**
   * Get a project document reference using projectID
   * @static
   * @param {String} id projectID
   * @return {Firebase.database.Reference} The reference to the project document
   * @memberof Fetch
   */
  static getProjectReference(id) {
    return Fire.firebase()
      .database()
      .ref("projects/" + (id || ""));
  }

  /**
   * Get a user document reference using user ID
   * @static
   * @param {String} id uid
   * @return {Firebase.database.Reference} The reference to the user document
   * @memberof Fetch
   */
  static getUserReference(id) {
    return Fire.firebase()
      .database()
      .ref("users/" + (id || ""));
  }

  /**
   * Gets a user/project with a reference to the database location
   * @static
   * @param  {Firebase.database.Reference} reference The location of the user or project
   * @param  {Function} targetType The type of object to convert to
   * @param  {Boolean} getDirectly Whether to bypass the cache
   * @return {Object}
   * @memberof Fetch
   */
  static async getObject(reference, targetType, getDirectly) {
    // Create a new instance of the target type, since targetType is a class.
    let target = new targetType();
    // Get data properties from either the cache or directly from the database, depending on whether getDirectly is true
    let source = getDirectly
      ? (await reference.once("value")).val()
      : await LocalCache.persist(reference.toString());
    // If the source doesn't exist then return null to signify that no data was found.
    if (!source) return null;
    // Merge the original object with the source object. This would cause the resulting object to have the type and methods of the target object but have the properties of the source.
    return Object.assign(target, source);
  }

  /**
   * Gets an actual message collection using ID
   * @static
   * @param  {String} id The collectionID of the project to get
   * @return {Messages} The messages collection
   * @memberof Fetch
   */
  static async getMessages(id) {
    return await Fetch.getObject(
      await Fetch.getMessagesReference(id),
      Messages,
      true
    );
  }

  /**
   * Gets an actual project using ID.
   * @static
   * @param  {String} id The projectID of the project to get
   * @return {Project} The project object
   * @memberof Fetch
   */
  static async getProject(id) {
    return await Fetch.getObject(
      await Fetch.getProjectReference(id),
      Project,
      true
    );
  }
  /**
   * Gets an actual user using ID.
   * Users are always fetched realtime from the server and is guaranteed to be up to date
   * @static
   * @param  {String} id
   * @return {User} The user object
   * @memberof Fetch
   */
  static async getUser(id) {
    return await Fetch.getObject(await Fetch.getUserReference(id), User, true);
  }

  /**
   * Gets users by their email address.
   * @static
   * @param  {String} email The email address to query for
   * @param  {Number} numberOfResults The number of results to return
   * @return {User[]}
   * @memberof Fetch
   */
  static async searchUserByEmail(email, numberOfResults) {
    // Query for a user with the matching email address
    let queryResult = await Fetch.getUserReference("")
      .orderByChild("email")
      .startAt(email)
      .endAt(email + "\uf8ff")
      .limitToFirst(numberOfResults)
      .once("value");
    let userResults = [];
    // Loop through every match and assigns the uid to userResult.
    queryResult.forEach(snapshot => {
      userResults.push(snapshot.val().uid);
    });
    return await Promise.all(userResults.map(item => Fetch.getUser(item)));
  }
}

/**
 * Represents a storage of cached data
 * @class LocalCache
 */
class LocalCache {
  /**
   * All cached items
   * @static
   * @memberof LocalCache
   */
  static cache = {};
  /**
   * Collection representing whether a URL is currently fetching new data.
   * @static
   * @memberof LocalCache
   */
  static pendingUpdates = {};

  /**
   * Set an item in the cache
   * @static
   * @param  {Object} request
   * @param  {Object} response
   * @return {void}
   * @memberof LocalCache
   */
  static set(request, response) {
    LocalCache.cache[JSON.stringify(request)] = response;
  }
  /**
   * Gets an item in the cache
   * @static
   * @param  {Object} request
   * @return
   * @memberof LocalCache
   */
  static get(request) {
    return LocalCache.cache[JSON.stringify(request)];
  }

  /**
   * Completes a request to the database while caching the result locally. Cache is stored in RAM and is cleared upon refresh.
   * @static
   * @param  {any} reqURL The URL to perform the request to. This should be a firebase database URL but could be any URL that will respond with the same protocol.
   * @return
   * @memberof LocalCache
   */
  static async persist(reqURL) {
    // A function to send a request to the database, return the value, and store it in cache.
    let fetchAndUpdate = async () => {
      // If there's already a request that is pending, return the cached version instead. Having multiple requests to the same location at the same time can lead to performance issues.
      if (LocalCache.pendingUpdates[reqURL] && LocalCache.get(reqURL))
        return LocalCache.get(reqURL);
      // Set this a flag for this request URL so that the cache remembers a request is under way.
      LocalCache.pendingUpdates[reqURL] = true;
      // Get an up-to-date version of the data from the database.
      let freshItem = (await Fire.firebase()
        .database()
        .refFromURL(reqURL)
        .once("value")).val();
      // Update the cache with the fresh item.
      LocalCache.set(reqURL, freshItem);
      LocalCache.pendingUpdates[reqURL] = false;
      // Return the fresh item.
      return freshItem;
    };
    // Return a cached version of the data if it exists. If it doesn't then wait for the data to arrive from the database.
    return LocalCache.get(reqURL)
      ? (() => {
          // Request for a fresh copy of the data anyways. Note that there's a lack of the `await` keyword. The method will be called asynchronously and won't block code execution.
          fetchAndUpdate();
          return LocalCache.get(reqURL);
        })()
      : fetchAndUpdate();
  }
}
