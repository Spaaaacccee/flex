import User from "./User";
import Project from "./Project";
import Messages, { Message } from "./Messages";
import Fetch from "./Fetch";
import Notify from "notifyjs";
import Moment from "moment";
import $, { EventEmitter } from "./Utils";
import { message } from "antd";
import UserGroupDisplay from "../components/UserGroupDisplay";
import { HistoryItem } from "./History";

/**
 * Responsible for emitting notifications
 * @export
 * @class Notifier
 * @extends EventEmitter
 */
export default class Notifier extends EventEmitter {
  static listeners = [];

  /**
   * Set the projects to notifier about
   * @static
   * @param  {any} projectIDs
   * @return {void}
   * @memberof Notifier
   */
  static async setProjects(projectIDs) {
    // For every existing listener that no longer exists in the new list, stop listening.
    Notifier.listeners.forEach(element => {
      let index = projectIDs.findIndex(x => x === element.projectID);
      if (index === -1) {
        // Stop listening and remove notifier
        element.stopListening();
        Notifier.listeners.splice(index, 0);
      }
    });

    // For every new listener that doesn't exist in the old list, create a new notifier and start listening.
    projectIDs.forEach(element => {
      let index = Notifier.listeners.findIndex(x => x.projectID === element);
      if (index === -1) {
        // Add notifier and start listening
        let newNotifier = new Notifier(element);
        newNotifier.startListening();
        Notifier.listeners.push(newNotifier);
      }
    });
  }

  /**
   * The uid of the project to notify about.
   * @type {String}
   * @memberof Notifier
   */
  projectID;

  /**
   * The data of the project to notify about.
   * @type {Project}
   * @memberof Notifier
   */
  project;
  /**
   * The messenger to read messages from, that is associated with the project.
   * @type {Messages}
   * @memberof Notifier
   */
  messenger;
  /**
   * The user that is receiving these messages.
   * @memberof Notifier
   */
  user;

  /**
   * Stops the notifier. This method is empty by default because it is generated dynamically by the `startListening` method.
   * @memberof Notifier
   */
  stopListening = () => {};

  /**
   *
   * @return {void}
   * @memberof Notifier
   */
  async startListening() {
    // Get the relevant project.
    this.project = await Project.get(this.projectID);
    // Get the relevant user.
    this.user = await User.getCurrentUser();

    // Define a listener to update the local project copy with a fresh copy every time the project changes.
    let valueListener = snapshot => {
      if (snapshot.val()) this.project = snapshot.val();
    };
    // Register this listener.
    Fetch.getProjectReference(this.projectID).on("value", valueListener);

    // Define a listener to create notification when a change to the project occurs.
    let historyChildListener = async snapshot => {
      // Only notify the user when the window is not in focus.
      if (!document.hasFocus()) {
        // Evaluate the new change.

        let item = snapshot.val();
        // If the new value is null, then return. This is just in case something went wrong getting or setting the new change.

        if (!item) return;

        // If the item is already read by the user, just in case, then return.
        if ((item.readBy || {})[this.user.uid]) return;

        // Create the notification and display it
        new Notify(`Bonfire - ${this.project.name}`, {
          body: await HistoryItem.getDescription(item),
          icon: "./icons/icon.png",
          notifyClick: () => {
            // Focus the window. This doesn't work in many browsers due to security concerns but sometimes works.
            window.focus();
            // On click, notify other components that the user has clicked on the item.
            this.emit("new_change", { projectID: this.projectID, item });
          }
        }).show();
      }
    };

    // Register the changes listener.
    Fetch.getProjectReference(this.projectID)
      .child("history")
      .on("child_added", historyChildListener);

    // Define the listener for events.
    let checkEventChanges = events => {
      events.forEach(item => {
        if (
          !(() => {
            if ((!item.notify && item.notify !== 0) || item.notify === -1)
              return;
            let timeDifference = new Moment(item.date).diff(
              new Moment(),
              "days"
            );
            if (timeDifference < item.notify) {
              if (
                item.markedAsCompleted ||
                (item.autoComplete && item.date <= Date.now())
              )
                return;
              if (
                UserGroupDisplay.hasUser(
                  item.involvedPeople,
                  this.project,
                  this.user
                ) ||
                item.creator === this.user.uid
              ) {
                new Notify(`Bonfire - ${this.project.name}`, {
                  body: `${timeDifference < 0 ? "(Overdue) " : ""}${
                    item.name
                  } - ${$.string(
                    $.date(item.date).humaniseDate()
                  ).capitaliseFirstLetter()}`,
                  icon: "./icons/icon.png",
                  notifyClick: () => {
                    window.focus();
                    this.emit("event", { projectID: this.projectID, item });
                  }
                }).show();
                return true;
              }
            }
          })()
        ) {
          setTimeout(() => {
            Project.get(this.projectID).then(project => {
              let freshEvent = (project.events || []).find(
                x => x.uid === item.uid
              );
              if (
                freshEvent &&
                JSON.stringify(freshEvent) === JSON.stringify(item)
              ) {
                checkEventChanges([item]);
              }
            });
          }, 1000 * 60 * 15);
        }
      });
    };
    checkEventChanges(this.project.events || []);
    let eventsListener = snapshot => {
      let event = snapshot.val();
      if (event) checkEventChanges([event]);
    };
    Fetch.getProjectReference(this.projectID)
      .child("events")
      .on("child_changed", eventsListener);
    this.messenger = await Messages.get(
      this.project.messengerID || this.project.projectID
    );
    let newMessageListener = msg => {
      if (!document.hasFocus()) {
        User.get(msg.sender).then(user => {
          new Notify(`Bonfire - ${this.project.name}`, {
            body: msg.content.bodyText,
            icon: user.profilePhoto,
            notifyClick: () => {
              window.focus();
              this.emit("message", { projectID: this.projectID, msg });
            }
          }).show();
        });
      }
    };
    this.messenger.on("new_message", newMessageListener);
    this.messenger.startListening();
    this.stopListening = () => {
      Fetch.getProjectReference(this.projectID).off("value", valueListener);
      Fetch.getProjectReference(this.projectID)
        .child("history")
        .off("child_added", historyChildListener);
      Fetch.getProjectReference(this.projectID)
        .child("events")
        .off("child_changed", eventsListener);
      this.messenger.off("new_message", newMessageListener);
    };
  }

  constructor(projectID) {
    super();
    this.projectID = projectID;
  }
}
