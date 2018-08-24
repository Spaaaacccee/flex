import CryptoJS from "crypto-js";

import $ from "./Utils";
import Role from "./Role";
import { RoleList } from "./Role";
import Member from "./Member";
import { MemberList } from "./Member";
import TimelineEvent from "./TimelineEvent";
import { message } from "antd";
import update from "immutability-helper";
import Fetch from "./Fetch";
import Document, {
  DocumentMeta,
  DocumentArchive,
  UploadJob,
  CloudDocument
} from "./Document";
import User from "./User";
import Messages from "./Messages";
import { HistoryItem, HistoryItemContent } from "./History";

/**
 * Represents a project
 * @export
 * @class Project
 */
export default class Project {
  /**
   * Checks whether two projects are exactly the same
   * @static
   * @param  {Project} a
   * @param  {Project} b
   * @return {Boolean}
   * @memberof Project
   */
  static equal(a, b) {
    if (!(a && b)) return false;
    let inequality = 0;
    inequality += a.projectID !== b.projectID;
    inequality += a.lastUpdatedTimestamp !== b.lastUpdatedTimestamp;
    return !inequality;
  }

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
      await Fetch.getProjectReference(projectID).set({ deleted: true });
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
  projectID = $.id().generateUID();

  /**
   * A user-friendly display name for the project
   * @type {String}
   * @memberof Project
   */
  name = "Untitled Project";

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
   * @type {Number}
   * @memberof Project
   */
  lastUpdatedTimestamp = Date.now();

  /**
   * The date and time the project was created
   * @type {Number}
   * @memberof Project
   */
  created = Date.now();

  /**
   * A description of this project
   * @type {String}
   * @memberof Project
   */
  description = "";

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
   * All events in this project
   * @type {Array<TimelineEvent>}
   * @memberof Project
   */
  events;
  /**
   * @type {Array<DocumentArchive>}
   * @memberof Project
   */
  files;

  /**
   * @type {Array<HistoryItem>}
   * @memberof Project
   */
  history;

  messengerID = null;

  /**
   * Creates an instance of Project.
   * @param  {any} name Name of the project
   * @memberof Project
   */
  constructor(name) {
    this.name = name || this.name;
  }

  /**
   * Completes an operation on this object while syncing with the server.
   * Operation is guaranteed to be performed on the most recent version of the object.
   *
   * @param  {(project:Project)=>void} operation The operation to perform.
   * @return {Boolean} Whether the operation completed successfully
   * @memberof Project
   */
  async transaction(operation) {
    let dateNow = Date.now();
    try {
      // Perform the operation on the database object
      await Fetch.getProjectReference(this.projectID).transaction(item => {
        if (item) {
          operation(item);
          item.lastUpdatedTimestamp = dateNow;
          return item;
        }
        return item;
      });
    } catch (e) {
      // Catch any problems with the database request
      return false;
    }
    // Perform the same operation on the local object
    operation(this);
    this.lastUpdatedTimestamp = dateNow;
    // Return true to signify the operation was successful.
    return true;
  }

  /**
   * Set the name of this project, both locally and in the database
   * @param  {String} newName
   * @return {void}
   * @memberof Project
   */
  async setName(newName) {
    await this.transaction(project => {
      // Set the project name
      project.name = newName;
      // Add a history event about this transaction
      if (project instanceof Project) {
        User.getCurrentUser().then(user => {
          project.addHistory(
            new HistoryItem({
              readBy: { [user.uid]: true },
              action: "edited",
              doneBy: user.uid,
              type: "name"
            })
          );
        });
      }
    });
  }
  /**
   * Set the description of this project, both locally and in the database
   * @param  {String} newDescription
   * @return {void}
   * @memberof Project
   */
  async setDescription(newDescription) {
    await this.transaction(project => {
      // Set the description.
      project.description = newDescription;
      // Add a history event about this transaction
      if (project instanceof Project) {
        User.getCurrentUser().then(user => {
          project.addHistory(
            new HistoryItem({
              readBy: { [user.uid]: true },
              action: "edited",
              doneBy: user.uid,
              type: "description"
            })
          );
        });
      }
    });
  }

  /**
   * Immediately set all roles of this project
   * @param  {Role[]} roles
   * @return {void}
   * @memberof Project
   */
  async setRoles(roles) {
    await this.transaction(project => {
      // Set the roles
      project.roles = roles;
      // Add a history event about this transaction
      if (project instanceof Project) {
        User.getCurrentUser().then(user => {
          project.addHistory(
            new HistoryItem({
              readBy: { [user.uid]: true },
              action: "edited",
              doneBy: user.uid,
              type: "roles"
            })
          );
        });
      }
    });
  }

  /**
   * Immediately set all members of this project
   * @param  {MemberList} members
   * @return {void}
   * @memberof Project
   */
  async setMembers(members) {
    // Get a reference to where the project is stored on the database.
    let project = await Fetch.getProjectReference(this.projectID);
    let dateNow = Date.now();
    // Set the members on the database
    await project.child("members").set(members);
    // Set the last modified timestamp
    await project.child("lastUpdatedTimestamp").set(dateNow);
    // Set the last modified timestamp
    this.lastUpdatedTimestamp = dateNow;
    // Set the members locally
    this.members = members;
  }

  /**
   * Adds a member
   * @param  {String} memberID
   * @param  {Role[]} roles
   * @return
   * @memberof Project
   */
  async addMember(memberID, roles) {
    // If no user id is specified, then the operation cannot continue, so return.
    if (!memberID) return;
    await this.transaction(project => {
      // Add the member to the list of members.
      project.members = update(project.members || [], {
        $push: [new Member(memberID, roles || [], true)]
      });
    });
  }

  /**
   * Set the roles of a single member of this project
   * @param  {String} memberID
   * @param  {Role[]} roles
   * @return {void}
   * @memberof Project
   */
  async setMember(memberID, roles) {
    // If no user id is specified, then the operation cannot continue, so return.
    if (!memberID) return;
    await this.transaction(project => {
      // Modify the roles of the target member.
      // Note that if the user doesn't exist, no change will be made.
      project.members = (project.members || []).map(
        item => (item.uid === memberID ? Object.assign(item, { roles }) : item)
      );
    });
  }

  /**
   * Set a single event
   * @param  {String} uid
   * @param  {TimelineEvent} eventData
   * @param {Boolean} completed
   * @return {void}
   * @memberof Project
   */
  async setEvent(uid, eventData, completed) {
    // If no event id is specified, then the operation cannot continue, so return.
    if (!uid) return;
    await this.transaction(project => {
      // Modify the data of the target event.
      // Note that if the event doesn't exist, no change will be made.
      project.events = (project.events || []).map(
        item => (item.uid === uid ? Object.assign(eventData, { uid }) : item)
      );
      // Add a history event about this transaction
      if (project instanceof Project) {
        User.getCurrentUser().then(user => {
          project.addHistory(
            new HistoryItem({
              readBy: { [user.uid]: true },
              // If the `completed` argument is true, then record this change as completing the event rather than editing the event.
              action: completed ? "completed" : "edited",
              doneBy: user.uid,
              type: "event",
              content: new HistoryItemContent({ uid })
            })
          );
        });
      }
    });
  }

  /**
   * Add an event to this project
   * @param  {TimelineEvent} event
   * @return {void}
   * @memberof Project
   */
  async addEvent(event) {
    await this.transaction(project => {
      project.events = project.events || [];
      // Add the event.
      project.events.push(event);
      // Add a history event about this transaction
      if (project instanceof Project) {
        User.getCurrentUser().then(user => {
          project.addHistory(
            new HistoryItem({
              readBy: { [user.uid]: true },
              action: "added",
              type: "event",
              doneBy: user.uid,
              content: new HistoryItemContent({ uid: event.uid })
            })
          );
        });
      }
    });
  }

  /**
   * Deletes an event
   * @param  {String} uid
   * @return {void}
   * @memberof Project
   */
  async deleteEvent(uid) {
    // If no event id is specified, then the operation cannot continue, so return.
    if (!uid) return;
    await this.transaction(project => {
      // Delete the event
      project.events = (project.events || []).filter(item => item.uid !== uid);
      // Add a history event about this transaction
      if (project instanceof Project) {
        User.getCurrentUser().then(user => {
          project.addHistory(
            new HistoryItem({
              readBy: { [user.uid]: true },
              action: "removed",
              type: "event",
              doneBy: user.uid,
              content: new HistoryItemContent({ uid })
            })
          );
        });
      }
    });
  }

  /**
   * Get the events in ascending date order.
   * @return {TimelineEvent[]}
   * @memberof Project
   */
  getEventsInDateOrder() {
    // Create a copy of the events.
    const events = (this.events || []).slice();
    // Return the events, sorted in ascending order.
    return events.sort((a, b) => a.date - b.date);
  }

  /**
   * Add a file to this project
   * @param  {File} file The file to add.
   * @param  {String} description Add a description to this file
   * @param {(e:{jobID:String, task:Firebase.storage.UploadTask})=>void} callback Adding a file may take a while, so instead of a `Promise`, you can set a callback to execute after this is done to avoid `await`s stopping the execution of the thread.
   * @param {String} forceName Force this file to use a specific file name
   * @return {void}
   * @memberof Project
   */
  addFile(file, description, callback, forceName) {
    // Override the file name with the forced name if it exists.
    const fileName = forceName || file.name;

    // Create a new job ID.
    const jobID = $.id().generateUID();

    // Register this job in the job manager.
    UploadJob.Jobs.setJob(
      new UploadJob({
        uid: jobID,
        totalBytes: file.size,
        name: fileName,
        project: this.projectID
      })
    );

    User.getCurrentUser().then(user => {
      // Generate a new archive ID and default the action type to adding a file.
      let archiveID;
      let actionType = "added";
      // Initiate a new file reader.
      const reader = new FileReader();
      reader.onloadend = async () => {
        // After the file is done reading, hash the file so that it can be compared to existing ones.
        const hash = CryptoJS.MD5(reader.result).toString();
        // Create the meta file for this file.
        let meta = new DocumentMeta({
          dateModifed: file.lastModifiedDate,
          name: file.name,
          type: file.type,
          size: file.size,
          description,
          uploader: user.uid,
          state: "available",
          hash
        });

        // Set the archive ID to be equal to the ID in the meta.
        archiveID = meta.uid;

        let task;
        let afterDone = () => {};

        // Add the by first determining if the file, or similar files exist.
        await this.transaction(project => {
          project.files = project.files || [];
          // Find an existing file where the type and name is the same.
          let existingArchive = $.array(project.files).indexOf(
            item => item.name === fileName && item.type === meta.type
          );
          if (existingArchive !== -1) {
            // If a file is found, then check if any versions of the file has exactly the same hash, and is therefore exactly the same.
            let existingFile =
              $.array(project.files[existingArchive].files).indexOf(
                item => item.hash === meta.hash
              ) !== -1;
            // If such file is found, display an error
            if (existingFile) {
              if (project instanceof Project)
                message.error("A file that's exactly the same already exists");
            } else {
              // Otherwise, set the archiveID as the existing file's ID
              archiveID = project.files[existingArchive].uid;
              // Change the action type to updating a file.
              actionType = "updated";
              if (project instanceof Project) {
                // Set the callback after the document has been uploaded to add the file meta into the database.
                afterDone = prj => {
                  prj.files[existingArchive].files =
                    prj.files[existingArchive].files || [];
                  prj.files[existingArchive].files.push(meta);
                };
                message.info(
                  `We're putting ${file.name} together with an existing copy.`
                );
                // Start the upload.
                task = Document.upload(file, meta);
              }
            }
          } else {
            // If it is not found, then add the file as a new archive.
            if (project instanceof Project) {
              // Set a callback after the upload is done to add the new archive into the database.
              afterDone = prj => {
                prj.files = prj.files || [];
                prj.files.push(
                  new DocumentArchive({
                    files: [meta],
                    name: fileName,
                    type: meta.type,
                    uid: archiveID
                  })
                );
              };
              // Start the upload.
              task = Document.upload(file, meta);
            }
          }
        });

        if (task) {
          UploadJob.Jobs.updateJob(jobID, {
            // Define what to do if the user cancels the job.
            cancelJob: () => {
              if (UploadJob.Jobs.getJob(jobID).status !== "done") {
                // If the job is not done yet then cancel the job.
                task.cancel();
                UploadJob.Jobs.updateJob(jobID, { status: "canceled" });
              }
            }
          });
          // Add a monitor for the upload progress.
          task.on("state_changed", ({ totalBytes, bytesTransferred }) => {
            UploadJob.Jobs.updateJob(jobID, {
              status: "uploading",
              totalBytes,
              bytesTransferred
            });
          });

          // Define what to do when the task is done.
          task.then(() => {
            // Execute the callback function as a transaction.
            this.transaction(prj => {
              afterDone(prj);
            });

            User.getCurrentUser().then(user => {
              // Add a history event about the change.
              this.addHistory(
                new HistoryItem({
                  readBy: { [user.uid]: true },
                  action: actionType,
                  type: "file",
                  doneBy: user.uid,
                  content: new HistoryItemContent({ uid: archiveID })
                })
              );
            });

            // Set the job as done in the job monitor.
            UploadJob.Jobs.updateJob(jobID, { status: "done" });
          });
        } else {
          // Otherwise, the job is canceled.
          UploadJob.Jobs.updateJob(jobID, {
            status: "canceled"
          });
        }

        // Execute the callback, providing the caller with information about this job.
        return callback({
          jobID,
          task
        });
      };

      // Start reading the file.
      reader.readAsBinaryString(file);
    });
  }

  /**
   * Add a Google Drive file.
   * @param  {any} file
   * @param  {()=>{}} callback
   * @return {void}
   * @memberof Project
   */
  addCloudFile(file, callback) {
    User.getCurrentUser().then(user => {
      this.transaction(project => {
        project.files = project.files || [];
        // An existing file exists for the same file, then display an error.
        if (
          project.files.find(
            item =>
              item.uploadType === "cloud" &&
              item.source.id &&
              item.source.id === file.id
          )
        ) {
          if (project instanceof Project) {
            message.error(`${file.name} already exists!`);
          }
        } else {
          // Otherwise, add the new file to the database.
          project.files.push(
            Object.assign(new CloudDocument(file), {
              uploader: user.uid
            })
          );
          // Add a history event about this document.
          if (project instanceof Project) {
            project
              .addHistory(
                new HistoryItem({
                  readBy: { [user.uid]: true },
                  action: "added",
                  type: "file",
                  doneBy: user.uid,
                  content: new HistoryItemContent({ uid: file.id })
                })
              )
              .then(() => {
                callback();
              });
          }
        }
      });
    });
  }

  /**
   * Tries to find a delete a file.
   * @param  {any} archive
   * @return
   * @memberof Project
   */
  async tryDelete(archive) {
    // If there is a uid, try to delete the file as a file archive
    if (archive.uid) {
      await this.deleteArchive(archive.uid);
      return true;
    }

    // Otherwise, try to delete as a Google Drive file
    if (archive.source.id) {
      await this.deleteCloudFile(archive.source.id);
      return true;
    }
    return false;
  }

  /**
   * Deletes an archive
   * @param  {String} archiveID
   * @return
   * @memberof Project
   */
  async deleteArchive(archiveID) {
    // If no id is specified then return.
    if (!archiveID) return;
    let user = await User.getCurrentUser();

    // Get a reference to the location where this file is stored in the database, and remove the file
    await Fetch.getProjectReference(this.projectID)
      .child("files")
      .set(this.files.filter(x => x.uid !== archiveID));

    // Find and delete all versions of the file with the specified ID.
    await Promise.all(
      (this.files.find(x => x.uid === archiveID).files || []).map(x =>
        Document.delete(x)
      )
    );

    // Register this change in the database.
    this.files = (this.files || []).filter(x => x.uid !== archiveID);

    // Add a history event about this change.
    await this.addHistory(
      new HistoryItem({
        readBy: { [user.uid]: true },
        doneBy: user.uid,
        action: "removed",
        type: "set of files",
        content: new HistoryItemContent({ uid: archiveID })
      })
    );
  }

  /**
   * Delete a single file.
   * @param  {String} archiveID
   * @param  {String} fileID
   * @return
   * @memberof Project
   */
  async deleteFile(archiveID, fileID) {
    // If either the file or archive ID is not specified then return.
    if (!archiveID || !fileID) return;
    let user = await User.getCurrentUser();
    // Find the specified archive. If it is not found then return.
    let archiveIndex = this.files.findIndex(x => x.uid === archiveID);
    if (archiveIndex === -1) return;

    // Get a reference to the location where the file is stored in the database, and remove the file
    await Fetch.getProjectReference(this.projectID)
      .child("files")
      .child(archiveIndex)
      .child("files")
      .set(
        (this.files[archiveIndex].files || []).filter(x => x.uid !== fileID)
      );

    // Delete the file.
    await Document.delete(
      this.files[archiveIndex].files.find(x => x.uid === fileID)
    );

    // Remove the file from the local copy of the project.
    this.files = this.files[archiveIndex].files.filter(x => x.uid !== fileID);

    // Add a history event about this change.
    await this.addHistory(
      new HistoryItem({
        readBy: { [user.uid]: true },
        doneBy: user.uid,
        action: "removed",
        type: "file",
        content: new HistoryItemContent({ uid: fileID })
      })
    );
  }

  /**
   * Delete a Google Drive file
   * @param  {String} sourceID
   * @return
   * @memberof Project
   */
  async deleteCloudFile(sourceID) {
    // If no Google Drive file id is specified then return.
    if (!sourceID) return;
    let user = await User.getCurrentUser();

    // Get a reference to the location where the file is stored in the database, and remove the file.
    await Fetch.getProjectReference(this.projectID)
      .child("files")
      .set(this.files.filter(x => (x.source || {}).id !== sourceID));
    // Make this change in the local copy of the project
    this.files = this.files.filter(x => (x.source || {}).id !== sourceID);

    // Add a history event about this change.
    await this.addHistory(
      new HistoryItem({
        readBy: { [user.uid]: true },
        doneBy: user.uid,
        action: "removed",
        type: "file",
        content: new HistoryItemContent({ uid: sourceID })
      })
    );
  }

  /**
   * Set the meta information of an existing file.
   * @param  {any} fileID
   * @param  {any} meta
   * @return {void}
   * @memberof Project
   */
  async setFileMeta(fileID, meta) {
    // If no file ID is specified, then return
    if (!fileID) return;
    await this.transaction(project => {
      project.files = project.files || [];
      project.files.forEach((archive, i) => {
        archive.files = archive.files || [];
        // Find the file using id.
        let j = $.array(archive.files).indexOf(item => item.uid === fileID);
        if (j !== -1) {
          // If the file is found, then set the meta.
          project.files[i].files[j] = meta;
        }
      });
    });
  }

  /**
   * Set the ID of the messenger associated with this project
   * @param  {any} messengerID
   * @return {void}
   * @memberof Project
   */
  async setMessenger(messengerID) {
    await this.transaction(project => {
      project.messengerID = messengerID;
    });
  }

  /**
   * Adds an event to history
   * @param {HistoryItem} historyItem
   * @return {void}
   * @memberof Project
   */
  async addHistory(historyItem) {
    await this.transaction(project => {
      project.history = project.history || [];
      project.history.push(historyItem);
    });
  }

  /**
   * Try to mark all of the changes as read.
   * @return {void}
   * @memberof Project
   */
  async trySetReadHistory() {
    let user = await User.getCurrentUser();
    await this.transaction(project => {
      for (let item of (project.history || []).reverse()) {
        if (!(item.readBy || {})[user.uid]) {
          item.readBy = {
            ...(item.readBy || {}),
            [user.uid]: true
          };
        }
      }
    });
  }

  /**
   * Set a single history item as read, or not read.
   * @param  {String} historyID
   * @param  {String} userID
   * @param  {Boolean} state
   * @return {void}
   * @memberof Project
   */
  async setReadHistory(historyID, userID, state) {
    // If the history item id or user is not defined, then return.
    if ((!historyID, userID)) return;
    await this.transaction(project => {
      project.history = project.history || [];
      // Find and set the item.
      let index = project.history.findIndex(x => x.uid === historyID);
      if (index !== -1) {
        project.history[index].readBy = {
          ...(project.history[index].readBy || {}),
          [userID]: state
        };
      }
    });
  }
}
