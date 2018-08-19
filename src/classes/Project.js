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

  // Set the name of this project, both locally and in the database
  async setName(newName) {
    await this.transaction(project => {
      project.name = newName;
      if (project instanceof Project) {
        User.getCurrentUser().then(user => {
          project.addHistory(
            new HistoryItem({
              readBy: {[user.uid]:true},
              action: "edited",
              doneBy: user.uid,
              type: "name"
            })
          );
        });
      }
    });
  }
  // Set the description of this project, both locally and in the database
  async setDescription(newDescription) {
    await this.transaction(project => {
      project.description = newDescription;
      if (project instanceof Project) {
        User.getCurrentUser().then(user => {
          project.addHistory(
            new HistoryItem({
              readBy: {[user.uid]:true},
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
      project.roles = roles;
    });
  }

  /**
   * Immediately set all members of this project
   * @param  {any} members
   * @return {void}
   * @memberof Project
   */
  async setMembers(members) {
    let project = await Fetch.getProjectReference(this.projectID);
    let dateNow = Date.now();
    await project.child("members").set(members);
    await project.child("lastUpdatedTimestamp").set(dateNow);
    this.lastUpdatedTimestamp = dateNow;
    this.members = members;
  }

  /**
   * Adds a member
   * @param  {any} uid
   * @param  {any} roles
   * @return
   * @memberof Project
   */
  async addMember(uid, roles) {
    if (!uid) return;
    await this.transaction(project => {
      project.members = update(project.members || [], {
        $push: [new Member(uid, roles || [], true)]
      });
    });
  }

  /**
   * Set the roles of a single member of this project
   * @param  {any} memberID
   * @param  {any} roles
   * @return {void}
   * @memberof Project
   */
  async setMember(memberID, roles) {
    await this.transaction(project => {
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
    await this.transaction(project => {
      project.events = (project.events || []).map(
        item => (item.uid === uid ? Object.assign(eventData, { uid }) : item)
      );
      if (project instanceof Project) {
        User.getCurrentUser().then(user => {
          project.addHistory(
            new HistoryItem({
              readBy: {[user.uid]:true},
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
      project.events.push(event);
      if (project instanceof Project) {
        User.getCurrentUser().then(user => {
          project.addHistory(
            new HistoryItem({
              readBy: {[user.uid]:true},
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
    await this.transaction(project => {
      project.events = (project.events || []).filter(item => item.uid !== uid);
      if (project instanceof Project) {
        User.getCurrentUser().then(user => {
          project.addHistory(
            new HistoryItem({
              readBy: {[user.uid]:true},
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

  getEventsInDateOrder() {
    const events = (this.events || []).slice();
    return events.sort(
      (a, b) => (a.date === b.date ? 0 : a.date > b.date ? 1 : -1)
    );
  }

  /**
   * Add a file to this project
   * @param  {File} file The file to add.
   * @param  {String} description Add a description to this file
   * @param {(e:{jobID:String, task:Firebase.storage.UploadTask})=>void} callback Adding a file may take a while, so instead of a `Promise`, you can set a callback to execute after this is done to avoid `await`s stopping the execution of the thread.
   * @return {void}
   * @memberof Project
   */
  addFile(file, description, callback) {
    const jobID = $.id().generateUID();

    UploadJob.Jobs.setJob(
      new UploadJob({
        uid: jobID,
        totalBytes: file.size,
        name: file.name,
        project: this.projectID
      })
    );

    const user = User.getCurrentUser().then(user => {
      let archiveID = $.id().generateUID();
      let actionType = "added";
      const reader = new FileReader();
      reader.onloadend = async () => {
        const hash = CryptoJS.MD5(reader.result).toString();
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

        archiveID = meta.uid;

        let task;

        let afterDone = () => {};

        await this.transaction(project => {
          project.files = project.files || [];
          let existingArchive = $.array(project.files).indexOf(
            item => item.name === meta.name && item.type === meta.type
          );
          if (existingArchive !== -1) {
            let existingFile =
              $.array(project.files[existingArchive].files).indexOf(
                item => item.hash === meta.hash
              ) !== -1;
            if (existingFile) {
              if (project instanceof Project)
                message.error("A file that's exactly the same already exists");
            } else {
              archiveID = project.files[existingArchive].uid;
              actionType = "updated";
              if (project instanceof Project) {
                afterDone = prj => {
                  prj.files[existingArchive].files =
                    prj.files[existingArchive].files || [];
                  prj.files[existingArchive].files.push(meta);
                };
                message.info(
                  `We're putting ${file.name} together with an existing copy.`
                );
                task = Document.upload(file, meta);
              }
            }
          } else {
            if (project instanceof Project) {
              afterDone = prj => {
                prj.files = prj.files || [];
                prj.files.push(
                  new DocumentArchive({
                    files: [meta],
                    name: meta.name,
                    type: meta.type,
                    uid: archiveID
                  })
                );
              };
              task = Document.upload(file, meta);
            }
          }
        });

        if (task) {
          UploadJob.Jobs.updateJob(jobID, {
            cancelJob: () => {
              if (UploadJob.Jobs.getJob(jobID).status !== "done") {
                task.cancel();
                UploadJob.Jobs.updateJob(jobID, { status: "canceled" });
              }
            }
          });
          task.on("state_changed", ({ totalBytes, bytesTransferred }) => {
            UploadJob.Jobs.updateJob(jobID, {
              status: "uploading",
              totalBytes,
              bytesTransferred
            });
          });
          task.then(() => {
            this.transaction(prj => {
              afterDone(prj);
            });
            User.getCurrentUser().then(user => {
              this.addHistory(
                new HistoryItem({
                  readBy: {[user.uid]:true},
                  action: actionType,
                  type: "file",
                  doneBy: user.uid,
                  content: new HistoryItemContent({ uid: archiveID })
                })
              );
            });

            UploadJob.Jobs.updateJob(jobID, { status: "done" });
          });
        } else {
          UploadJob.Jobs.updateJob(jobID, {
            status: "canceled"
          });
        }

        return callback({
          jobID,
          task
        });
      };
      reader.readAsBinaryString(file);
    });
  }

  addCloudFile(file, callback) {
    User.getCurrentUser().then(user => {
      this.transaction(project => {
        project.files = project.files || [];
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
          project.files.push(
            Object.assign(new CloudDocument(file), {
              uploader: user.uid
            })
          );
          if (project instanceof Project) {
            project
              .addHistory(
                new HistoryItem({
                  readBy: {[user.uid]:true},
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

  async tryDelete(archive) {
    if (archive.uid) {
      await this.deleteArchive(archive.uid);
      return true;
    }
    if (archive.source.id) {
      await this.deleteCloudFile(archive.source.id);
      return true;
    }
    return false;
  }

  async deleteArchive(archiveID) {
    if (!archiveID) return;
    let user = await User.getCurrentUser();
    await Fetch.getProjectReference(this.projectID)
      .child("files")
      .set(this.files.filter(x => x.uid !== archiveID));
    await Promise.all(
      (this.files.find(x => x.uid === archiveID).files || []).map(x =>
        Document.delete(x)
      )
    );
    this.files = (this.files || []).filter(x => x.uid !== archiveID);
    await this.addHistory(
      new HistoryItem({
        readBy: {[user.uid]:true},
        doneBy: user.uid,
        action: "removed",
        type: "set of files",
        content: new HistoryItemContent({ uid: archiveID })
      })
    );
  }

  async deleteFile(archiveID, fileID) {
    if (!archiveID || !fileID) return;
    let user = await User.getCurrentUser();
    let archiveIndex = this.files.findIndex(x => x.uid === archiveID);
    if (archiveIndex === -1) return;
    await Fetch.getProjectReference(this.projectID)
      .child("files")
      .child(archiveIndex)
      .child("files")
      .set(
        (this.files[archiveIndex].files || []).filter(x => x.uid !== fileID)
      );
    await Document.delete(
      this.files[archiveIndex].files.find(x => x.uid === fileID)
    );
    this.files = this.files[archiveIndex].files.filter(x => x.uid !== fileID);
    await this.addHistory(
      new HistoryItem({
        readBy: {[user.uid]:true},
        doneBy: user.uid,
        action: "removed",
        type: "file",
        content: new HistoryItemContent({ uid: fileID })
      })
    );
  }

  async deleteCloudFile(sourceID) {
    if (!sourceID) return;
    let user = await User.getCurrentUser();
    await Fetch.getProjectReference(this.projectID)
      .child("files")
      .set(this.files.filter(x => (x.source || {}).id !== sourceID));
    this.files = this.files.filter(x => (x.source || {}).id !== sourceID);
    await this.addHistory(
      new HistoryItem({
        readBy: {[user.uid]:true},
        doneBy: user.uid,
        action: "removed",
        type: "file",
        content: new HistoryItemContent({ uid: sourceID })
      })
    );
  }

  getFileMeta(fileID) {}

  async setFileMeta(fileID, meta) {
    await this.transaction(project => {
      project.files = project.files || [];
      project.files.forEach((archive, i) => {
        archive.files = archive.files || [];
        let j = $.array(archive.files).indexOf(item => item.uid === fileID);
        if (j !== -1) {
          project.files[i].files[j] = meta;
        }
      });
    });
  }

  /**
   *
   * @param  {String} hashString
   * @return {DocumentMeta}
   * @memberof Project
   */
  getFileMetaByHash(hashString) {}

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

  async trySetReadHistory() {
    let user = await User.getCurrentUser();
    for (let item of this.history || []) {
      if (!(item.readBy || {})[user.uid]) {
        await this.setReadHistory(item.uid, user.uid, true);
      }
    }
  }
  async setReadHistory(historyID, userID, state) {
    await this.transaction(project => {
      project.history = project.history || [];
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
