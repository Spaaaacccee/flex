import $ from "./Utils";
import User from "./User";
import Messages from "./Messages";

/**
 * Utilities for managing local backups
 * @export
 * @class Backup
 */
export default class Backup {
  /**
   * Adds a new backup to local storage
   * @static
   * @param  {String} projectID
   * @param  {Project} project
   * @return {Promise}
   * @memberof Backup
   */
  static async backupProject(projectID, project) {
    // Get the current user
    let user = await User.getCurrentUser();
    // Add a new backup, adding date, user, message info.
    Backup.mergeRepo("projects", {
      [projectID]: {
        [Date.now()]: await new Backup({
          madeBy: user.uid,
          sourceProject: project
        }).snapshotMessages()
      }
    });
  }

  /**
   * Adds an object to the local storage via merging
   * @static
   * @param  {String} path
   * @param  {any} object
   * @return {Promise}
   * @memberof Backup
   */
  static async mergeRepo(path, object) {
    localStorage.setItem(
      path,
      // Here we're merging the existing item from localStorage with the new object. Since localStorage only accepts strings, we deserialise the data from localStorage, apply the new version, then serialise the whole thing.
      JSON.stringify(
        $.object(JSON.parse(localStorage.getItem(path) || "{}")).mergeDeep(
          object
        )
      )
    );
  }

  /**
   * UID of the user who made the backup
   * @type {String}
   * @memberof Backup
   */
  madeBy;
  /**
   * The backup of the project
   * @type {Project}
   * @memberof Backup
   */
  sourceProject;
  /**
   * The messages of the backed up project
   * @memberof Backup
   */
  sourceMessages = {};

  /**
   * Creates an instance of Backup.
   * @param  {Backup} args
   * @memberof Backup
   */
  constructor(args) {
    Object.assign(this, args);
  }

  /**
   * Add a snapshot of all the messages associated with this project to this backup
   * @return
   * @memberof Backup
   */
  async snapshotMessages() {
    // Get the messenger instance
    let messenger = await Messages.get(
      this.sourceProject.messengerID || this.sourceProject.projectID
    );
    if (messenger) {
      // If a messenger is found then add the messages to this backup
      this.sourceMessages = messenger.messages;
    }
    // Return the new backup
    return this;
  }
}
