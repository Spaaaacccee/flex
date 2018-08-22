import User from "./User";
import Project from "./Project";
import Messages, { Message } from "./Messages";
import Fetch from "./Fetch";
import Notify from "notifyjs";
import Moment from "moment";
import $, { EventEmitter } from "./Utils";
import { message } from "antd";
import UserGroupDisplay from "../components/UserGroupDisplay";

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
    Notifier.listeners.forEach(element => {
      let index = projectIDs.findIndex(x => x === element.projectID);
      if (index === -1) {
        // Stop listening and remove notifier
        element.stopListening();
        Notifier.listeners.splice(index, 0);
      }
    });
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

  projectID;
  project;
  messenger;
  user;

  stopListening = () => {};

  async startListening() {
    this.project = await Project.get(this.projectID);
    this.user = await User.getCurrentUser();
    let valueListener = snapshot => {
      if (snapshot.val()) this.project = snapshot.val();
    };
    Fetch.getProjectReference(this.projectID).on("value", valueListener);
    let historyChildListener = snapshot => {
      if (!document.hasFocus()) {
        let item = snapshot.val();
        if (!item) return;
        if ((item.readBy || {})[this.user.uid]) return;
        User.get(item.doneBy).then(user => {
          let body = `${user.name} ${item.action} ${
            item.type === "name" || item.type === "description"
              ? "the project"
              : item.type === "project"
                ? "this"
                : $.string(item.type.substring(0, 1)).isVowel()
                  ? "an"
                  : "a"
          } ${item.type}`;

          new Notify(`Bonfire - ${this.project.name}`, {
            body,
            icon: "./icons/icon.png",
            notifyClick: () => {
              window.focus();
              this.emit("new_change", { projectID: this.projectID, item });
            }
          }).show();
        });
      }
    };
    Fetch.getProjectReference(this.projectID)
      .child("history")
      .on("child_added", historyChildListener);
    let checkEvents = events => {
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
                )||item.creator===this.user.uid
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
                checkEvents([item]);
              }
            });
          }, 1000 * 60 * 15);
        }
      });
    };
    checkEvents(this.project.events || []);
    let eventsListener = snapshot => {
      let event = snapshot.val();
      if (event) checkEvents([event]);
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
