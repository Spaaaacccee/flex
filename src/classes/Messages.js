import $, { EventEmitter } from "./Utils";
import React, { Component } from "react";
import Fetch from "./Fetch";
import User from "./User";

/**
 * A collection of messages
 * @export
 * @class Messages
 */
export default class Messages extends EventEmitter {
  static equal(a, b) {
    if (!(a && b)) return false;
    let inequality = 0;
    inequality += a.uid !== b.uid;
    return !inequality;
  }
  /**
   * Gets a message collection, alias to `Fetch.getMessages`
   * @static
   * @param  {String} collectionID
   * @return {Promise<Messages>}
   * @memberof Messages
   */
  static async get(collectionID) {
    return await Fetch.getMessages(collectionID);
  }

  /**
   * Instantly modifies a message collection
   * @static
   * @param  {String} collectionID
   * @param  {Messages} messages
   * @return {void}
   * @memberof Messages
   */
  static async forceUpdate(collectionID, messages) {
    try {
      // Merge the old user with the new. If no old user is found then an empty object will be used.
      messages = Object.assign(
        (await Messages.get(collectionID)) || {},
        messages
      );
      messages.uid = collectionID;
      // Set the last updated timestamp to now.
      messages.lastUpdatedTimestamp = Date.now();
      // Set the resulting project
      (await Fetch.getMessagesReference(collectionID)).set(messages);
      // Return true to signify that the operation was successful.
      return true;
    } catch (e) {
      // Catch any errors that may show up from the request.
      console.log(e);
      return false;
    }
  }

  uid = $.id().generateUID();

  lastUpdatedTimestamp = Date.now();

  /**
   * All messages, indexed by uid
   * @type {Object}
   * @memberof Messages
   */
  messages = {};

  /**
   * @param {{(messages:Messages)=>Void}} operation
   * @return {Promise<Boolean>}
   * @memberof Messages
   */
  async transaction(operation) {
    let dateNow = Date.now();
    try {
      // Perform the operation on the database object
      await Fetch.getMessagesReference(this.uid).transaction(item => {
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

  async setData(id, newData) {
    await Fetch.getMessagesReference(this.uid)
      .child("messages")
      .child(id)
      .set(newData);
  }

  /**
   *
   * @param  {String} id
   * @param  {Boolean} isRead
   * @return {void}
   * @memberof Messages
   */
  async setRead(id, isRead) {
    if (!id) return;
    let current = await Fetch.getMessagesReference(this.uid)
      .child("messages")
      .child(id)
      .once("value");
    if (!current.val()) return;
    await Fetch.getMessagesReference(this.uid)
      .child("messages")
      .child(id)
      .child("readBy")
      .child((await User.getCurrentUser()).uid)
      .set(isRead);
  }

  async addMessage(message) {
    await this.setData(message.uid, message);
    this.messages[message.uid] = message;
  }

  async deleteMessage(messageID) {
    await this.setData(messageID, null);
    this.messages[messageID] = null;
    delete this.messages[messageID];
  }

  async setMessage(messageID, message) {
    await this.setData(messageID, message);
    this.messages[messageID] = Object.assign(message, { uid: messageID });
  }

  async getMessagesByDateOrder(limit) {
    return (await Fetch.getMessagesReference(this.uid)
      .child("messages")
      .orderByChild("timeSent")
      .limitToLast(limit || Infinity)
      .once("value")).val();
  }

  startListening() {
    if (this.uid === undefined) return;
    const ref = Fetch.getMessagesReference(this.uid).child("messages");
    ref.on("child_added", snapshot => {
      const message = snapshot.val();
      if (!message || !message.content) return;
      this.messages = this.messages || {};
      if (!this.messages[message.uid]) {
        this.emit("new_message", message);
      }
      this.messages[message.uid] = message;
      this.emit("message", message);
      this.emit("change", this.messages);
    });
    ref.on("child_changed", snapshot => {
      const message = snapshot.val();
      if (!message || !message.content) return;
      this.messages = this.messages || {};
      this.messages[message.uid] = message;
      this.emit("edit", message);
      this.emit("change", this.messages);
    });
    ref.on("child_removed", snapshot => {
      const message = snapshot.val();
      if (!message || !message.content) return;
      this.messages[message.uid] = null;
      delete this.messages[message.uid];
      this.emit("delete", message);
      this.emit("change", this.messages);
    });
  }

  stopListening() {
    if (this.uid === undefined) return;
    Fetch.getMessagesReference(this.uid).off();
  }
}

export class Message {
  /**
   * The content of this message.
   * @type {MessageContent}
   * @memberof Message
   */
  content = new MessageContent();
  /**
   * A unique ID of this message.
   * @type {String}
   * @memberof Message
   */
  uid = $.id().generateUID();
  /**
   * The user ID of the user who sent this message
   * @type {String}
   * @memberof Message
   */
  sender;
  /**
   * The time this message was added to messages.
   * @type {Integer}
   * @memberof Message
   */
  timeSent = Date.now();
  /**
   * A collection of people who have read this message.
   * @memberof Message
   */
  readBy = {};
  /**
   * Creates an instance of Message.
   * @param  {Message} args
   * @memberof Message
   */
  constructor(args) {
    if (args.content) args.content = new MessageContent(args.content);
    Object.assign(this, args);
  }
}

export class MessageContent {
  bodyText = "";
  files = [];
  events = [];
  histories = [];
  /**
   * @type {{roles:UserGroupRule[], members: UserGroupRule[]}}
   * @memberof MessageContent
   */
  people = {
    roles: {},
    members: {}
  };
  /**
   * Creates an instance of MessageContent.
   * @param  {MessageContent} args
   * @memberof MessageContent
   */
  constructor(args) {
    Object.assign(this, args);
  }
}

export class UserGroupRule {
  query;
  uid;
  /**
   * Creates an instance of UserGroupRule.
   * @param  {UserGroupRule} args
   * @memberof UserGroupRule
   */
  constructor(args) {
    Object.assign(this, args);
  }
}
