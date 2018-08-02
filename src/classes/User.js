import Fetch from "./Fetch";
import Fire from "./Fire";
import Project from "./Project";
import Role from "./Role";
import Member from "./Member";

import { message } from "antd";
import { ArrayUtils } from "./Utils";
import Messages from "./Messages";

/**
 * Represents a single user
 * @export
 * @class User
 */
export default class User {
  /**
   * Gets the user that is signed in.
   *
   * If no user is signed in then null is returned
   * @static
   * @return
   * @memberof User
   */
  static async getCurrentUser() {
    if (!Fire.firebase().auth().currentUser) return null;
    return await User.get(Fire.firebase().auth().currentUser.uid);
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
   * All projects that the user has joined
   * @memberof User
   */
  joinedProjects = [];

  /**
   * All invites that this user has received
   * @memberof User
   */
  pendingInvites = [];

  /**
   * Completes an operation on this object while syncing with the server.
   * Operation is guaranteed to be performed on the most recent version of the object.
   *
   * @param  {Function} operation The operation to perform. Use the `this` keyword to refer to this object like usual. Note: The function must be written as a function expression, and not an arrow function due to lexical `this` differences.
   * @return {Boolean} Whether the operation completed successfully
   * @memberof User
   */
  async transaction(operation) {
    let dateNow = Date.now();
    try {
      // Perform the operation on the database object
      await Fetch.getUserReference(this.uid).transaction(item => {
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

  /**
   * Deletes an invite
   * @param  {any} projectID
   * @return {void}
   * @memberof User
   */
  async rejectInvite(projectID) {
    await this.transaction(function() {
      this.pendingInvites = this.pendingInvites || [];
      ArrayUtils.remove(this.pendingInvites, projectID);
    });
  }

  /**
   * Adds an invite to this user
   * @param  {any} projectID
   * @return {void}
   * @memberof User
   */
  async addInvite(projectID) {
    await this.transaction(function() {
      // Conditionally initialise pendingInvites with an empty array so it is not undefined.
      this.pendingInvites = this.pendingInvites || [];
      // Test whether the current user already has an invite for the same project.
      if (ArrayUtils.exists(this.pendingInvites, projectID)) {
        // Since transaction is run twice, once with the local User object, and once with the database JSON object, we can display an error once by testing if the transaction is being run on the local User object.
        if (this instanceof User) {
          message.error(
            `We couldn't send an invite to ${
              this.name
            } because there's already a pending invite.`
          );
        }
        return;
      }
      // Conditionally initialise joinedProjects with an empty array so it is not undefined.
      this.joinedProjects = this.joinedProjects || [];
      // Test whether the current user already has joined the project.
      if (ArrayUtils.exists(this.joinedProjects, projectID)) {
        // Since transaction is run twice, once with the local User object, and once with the database JSON object, we can display an error once by testing if the transaction is being run on the local User object.
        if (this instanceof User) {
          message.error(
            `We couldn't send an invite to ${
              this.name
            } because they're already part of this project.`
          );
        }
        return;
      }

      // Conditionally initialise projects with an empty array so it is not undefined.
      this.projects = this.projects || [];
      // Test whether the current user owns the project.
      if (ArrayUtils.exists(this.projects, projectID)) {
        // Since transaction is run twice, once with the local User object, and once with the database JSON object, we can display an error once by testing if the transaction is being run on the local User object.
        if (this instanceof User) {
          message.error(`Don't send an invite to yourself!`);
        }
        return;
      }

      // Otherwise, add the project into the pendingInvites array of this User.
      this.pendingInvites.push(projectID);

      if (this instanceof User)
        message.success(`Invitation sent to ${this.name}!`);
    });
  }

  /**
   * Accept an invite by adding it into joinedProjects and other necessary tasks
   * @param  {any} projectID
   * @return {void}
   * @memberof User
   */
  async acceptInvite(projectID) {
    this.transaction(function() {
      // Check if pendingInvites is not empty and contains the specified project ID.
      if (
        this.pendingInvites &&
        ArrayUtils.exists(this.pendingInvites, projectID)
      ) {
        // Initialise required properties so they're not undefined.
        this.joinedProjects = this.joinedProjects || [];
        this.projects = this.projects || [];
        // Check if the user has already joined, or is part of, this project. This check is redundant as adding an invite already has a check for the same thing but this is here just in case.
        if (
          !(
            ArrayUtils.exists(this.projects, projectID) ||
            ArrayUtils.exists(this.joinedProjects, projectID)
          )
        ) {
          // Add the project to joinedProjects
          this.joinedProjects.push(projectID);
          // Remove the project invite
          ArrayUtils.remove(this.pendingInvites, projectID);
          // Since transaction is run twice, once with the local User object, and once with the database JSON object, we can display an error once by testing if the transaction is being run on the local User object.
          if (this instanceof User) {
            Project.get(projectID).then(project => {
              project.addMember(this.uid).then(() => {
                message.success(`You've successfully joined ${project.name}`);
              });
            });
          }
        } else {
          if (this instanceof User) {
            message.error(`You tried to join a project you're already in!`);
          }
          return;
        }
      }
    });
  }

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
        project.members = project.members || [];
        project.members.push(new Member(this.uid, []));
        // Create a new messages instance in the database
        await Messages.forceUpdate(
          project.projectID,
          new Messages()
        )
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

  async leaveProject(projectID) {
    if (ArrayUtils.exists(this.joinedProjects, projectID)) {
      this.transaction(function() {
        ArrayUtils.remove(this.joinedProjects, projectID);
        if (this instanceof User) {
          Project.get(projectID).then(project => {
            project.setMembers(
              ArrayUtils.removeIf(
                project.members,
                (item, index) => item.uid === this.uid
              )
            );
            message.success(`Successfully left ${project.name}`);
          });
        }
      });
    }
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
