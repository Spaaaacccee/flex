import Fetch from "./Fetch";
import Fire from "./Fire";
import Project from "./Project";
import Role from "./Role";
import Member from "./Member";

import { message } from "antd";
import $ from "./Utils";
import Messages from "./Messages";
import { HistoryItem } from "./History";

/**
 * Represents a single user
 * @export
 * @class User
 */
export default class User {
  /**
   * Checks whether two users are exactly the same
   * @static
   * @param  {User} a
   * @param  {User} b
   * @return {Boolean}
   * @memberof Project
   */
  static equal(a, b) {
    if (!(a && b)) return false;
    let inequality = 0;
    inequality += a.uid !== b.uid;
    inequality += a.lastUpdatedTimestamp !== b.lastUpdatedTimestamp;
    return !inequality;
  }

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
          operation(item);
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
    operation(this);
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
    await this.transaction(user => {
      user.pendingInvites = user.pendingInvites || [];
      user.pendingInvites = $.array(user.pendingInvites).remove(projectID);
    });
  }

  /**
   * Adds an invite to this user
   * @param  {any} projectID
   * @return {void}
   * @memberof User
   */
  async addInvite(projectID) {
    await this.transaction(user => {
      // Conditionally initialise pendingInvites with an empty array so it is not undefined.
      user.pendingInvites = user.pendingInvites || [];
      // Test whether the current user already has an invite for the same project.
      if ($.array(user.pendingInvites).exists(projectID)) {
        // Since transaction is run twice, once with the local User object, and once with the database JSON object, we can display an error once by testing if the transaction is being run on the local User object.
        if (user instanceof User) {
          message.error(
            `We couldn't send an invite to ${
              user.name
            } because there's already a pending invite.`
          );
        }
        return;
      }
      // Conditionally initialise joinedProjects with an empty array so it is not undefined.
      user.joinedProjects = user.joinedProjects || [];
      // Test whether the current user already has joined the project.
      if ($.array(user.joinedProjects).exists(projectID)) {
        // Since transaction is run twice, once with the local User object, and once with the database JSON object, we can display an error once by testing if the transaction is being run on the local User object.
        if (user instanceof User) {
          message.error(
            `We couldn't send an invite to ${
              user.name
            } because they're already part of this project.`
          );
        }
        return;
      }

      // Conditionally initialise projects with an empty array so it is not undefined.
      user.projects = user.projects || [];
      // Test whether the current user owns the project.
      if ($.array(user.projects).exists(projectID)) {
        // Since transaction is run twice, once with the local User object, and once with the database JSON object, we can display an error once by testing if the transaction is being run on the local User object.
        if (user instanceof User) {
          message.error(`Don't send an invite to yourself!`);
        }
        return;
      }

      // Otherwise, add the project into the pendingInvites array of this User.
      user.pendingInvites.push(projectID);

      if (user instanceof User)
        message.success(`Invitation sent to ${user.name}!`);
    });
  }

  /**
   * Accept an invite by adding it into joinedProjects and other necessary tasks
   * @param  {any} projectID
   * @return {void}
   * @memberof User
   */
  async acceptInvite(projectID) {
    if (await Project.get(projectID)) {
      this.transaction(user => {
        // Check if pendingInvites is not empty and contains the specified project ID.
        if (
          user.pendingInvites &&
          $.array(user.pendingInvites).exists(projectID)
        ) {
          // Initialise required properties so they're not undefined.
          user.joinedProjects = user.joinedProjects || [];
          user.projects = user.projects || [];
          // Check if the user has already joined, or is part of, this project. This check is redundant as adding an invite already has a check for the same thing but this is here just in case.
          if (
            !(
              $.array(user.projects).exists(projectID) ||
              $.array(user.joinedProjects).exists(projectID)
            )
          ) {
            // Add the project to joinedProjects
            user.joinedProjects.push(projectID);
            // Remove the project invite
            user.pendingInvites = $.array(user.pendingInvites).remove(
              projectID
            );
            // Since transaction is run twice, once with the local User object, and once with the database JSON object, we can display an error once by testing if the transaction is being run on the local User object.
            if (user instanceof User) {
              Project.get(projectID).then(project => {
                project.addMember(user.uid).then(() => {
                  message.success(`You've successfully joined ${project.name}`);
                });
                project.addHistory(
                  new HistoryItem({
                    readBy: { [this.uid]: true },
                    action: "joined",
                    type: "project",
                    doneBy: this.uid
                  })
                );
              });
            }
          } else {
            if (user instanceof User) {
              message.error(`You tried to join a project you're already in!`);
            }
            return;
          }
        }
      });
    } else {
      message.error("The project you're trying to join doesn't exist anymore");
    }
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
        project.history = project.history || [];
        project.history.push(
          new HistoryItem({
            readBy: { [this.uid]: true },
            action: "created",
            type: "project",
            doneBy: this.uid
          })
        );
        // Create a new messages instance in the database
        await Messages.forceUpdate(project.projectID, new Messages());
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

  async leaveProject(projectID, suppressMessages) {
    if ($.array(this.joinedProjects || []).exists(projectID)) {
      await this.transaction(user => {
        user.joinedProjects = $.array(user.joinedProjects || []).remove(
          projectID
        );
      });
      let project = await Project.get(projectID);
      await project.addHistory(
        new HistoryItem({
          readBy: { [this.uid]: true },
          action: "left",
          type: "project",
          doneBy: this.uid
        })
      );
      await project.setMembers(
        project.members.filter(item => item.uid !== this.uid)
      );
    } else {
      if (!suppressMessages)
        message.error("You can't leave a project you haven't joined!");
        return 1;
    }
  }

  async deleteProject(projectID) {
    if ($.array(this.projects || []).exists(projectID)) {
      this.transaction(user => {
        user.projects = $.array(user.projects).remove(projectID);
        if (user instanceof User) {
          Project.delete(projectID);
        }
      });
    } else {
      message.error("You don't own the project you're trying to delete.");
      return 1;
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
