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
  /**
   * A utility to determine whether two messengers are the same.
   * @static
   * @param  {any} a
   * @param  {any} b
   * @return
   * @memberof Messages
   */
  static equal(a, b) {
    // If either of the objects are null or undefined, return false.
    if (!(a && b)) return false;
    // Return whether the two items have the same ID.
    return a.uid === b.uid;
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
   * Instantly modifies a message collection. This is used when initialising a messenger.
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

  /**
   * The last time this collection of messages was changed.
   * @type {Number}
   * @memberof Messages
   */
  lastUpdatedTimestamp = Date.now();

  /**
   * All messages, indexed by uid
   * @type {Object}
   * @memberof Messages
   */
  messages = {};

  /**
   * Performs an operation on the latest version of the messenger
   * @param {{(messages:Messages)=>Void}} operation
   * @return {Promise<Boolean>} Whether the operation was successful.
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
      return false;
    }
    // Perform the same operation on the local object
    operation(this);
    this.lastUpdatedTimestamp = dateNow;
    // Return true to signify the operation was successful.
    return true;
  }

  /**
   * Updates the timestamp of this messenger to the current time.
   * @return {void}
   * @memberof Messages
   */
  async updateTimestamp() {
    // Get current time.
    let dateNow = Date.now();
    // Set database last updated value
    await Fetch.getMessagesReference(this.uid)
      .child("lastUpdatedTimestamp")
      .set(dateNow);
    // Set local last updated value
    this.lastUpdatedTimestamp = dateNow;
  }

  /**
   * Instantly set a message on the server.
   * @param  {any} id
   * @param  {any} newData
   * @return {void}
   * @memberof Messages
   */
  async setData(id, newData) {
    // Set the message with the right ID with the new data.
    await Fetch.getMessagesReference(this.uid)
      .child("messages")
      .child(id)
      .set(newData);
    // Update the timestamp for the last change.
    this.updateTimestamp();
  }

  /**
   * Mark a message as read.
   * @param  {String} id
   * @param  {Boolean} isRead
   * @return {void}
   * @memberof Messages
   */
  async setRead(id, isRead) {
    // The ID is a null or undefined value, cancel setting a message as read.
    if (!id) return 0;
    // Get the current version of the message. If it doesn't exist, then cancel setting the message as read.
    let current = await Fetch.getMessagesReference(this.uid)
      .child("messages")
      .child(id)
      .once("value");
    if (!current.val()) return 0;
    // Mark the message as read.
    await Fetch.getMessagesReference(this.uid)
      .child("messages")
      .child(id)
      .child("readBy")
      .child((await User.getCurrentUser()).uid)
      .set(isRead);
    // Update the timestamp for the last change.
    this.updateTimestamp();
    // Return true to signify that the operation was successful.
    return 1;
  }

  /**
   * Add a new message to this collection.
   * @param  {Message} message
   * @return {void}
   * @memberof Messages
   */
  async addMessage(message) {
    await this.setData(message.uid, message);
    this.messages[message.uid] = message;
  }

  /**
   * Deletes a message
   * @param  {String} messageID
   * @return {void}
   * @memberof Messages
   */
  async deleteMessage(messageID) {
    // Set the message as null
    await this.setData(messageID, null);
    // Set the local copy as null, then delete it.
    this.messages[messageID] = null;
    delete this.messages[messageID];
  }

  /**
   * Set a message with new data.
   * @param  {any} messageID
   * @param  {any} message
   * @memberof Messages
   */
  async setMessage(messageID, message) {
    let newMessage = { ...message, ...{ uid: messageID } };
    // Set the message on the database.
    await this.setData(messageID, newMessage);
    // Set the message locally.
    this.messages[messageID] = newMessage;
  }

  /**
   * Get an array of messages by time order.
   * @param  {any} limit
   * @return
   * @memberof Messages
   */
  async getMessagesByDateOrder(limit) {
    // Create a query for the database to order the messages by time and return the result.
    return (await Fetch.getMessagesReference(this.uid)
      .child("messages")
      .orderByChild("timeSent")
      .limitToLast(limit || Infinity)
      .once("value")).val();
  }

  /**
   * Start listening for new messages.
   * @return
   * @memberof Messages
   */
  startListening() {
    // If this object doesn't have a uid it could potentially create problematic queries, so return.
    if (this.uid === undefined) return;
    // Get a reference to where the messages are stored.
    const ref = Fetch.getMessagesReference(this.uid).child("messages");
    // Add a handler for when a message is added.
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
    // Add a handler for when a message is changed, e.g. edited.
    ref.on("child_changed", snapshot => {
      const message = snapshot.val();
      if (!message || !message.content) return;
      this.messages = this.messages || {};
      this.messages[message.uid] = message;
      this.emit("edit", message);
      this.emit("change", this.messages);
    });
    // Add a handler for when a message is deleted.
    ref.on("child_removed", snapshot => {
      const message = snapshot.val();
      if (!message || !message.content) return;
      this.messages[message.uid] = null;
      delete this.messages[message.uid];
      this.emit("delete", message);
      this.emit("change", this.messages);
    });
  }

  // Stop listening to new message events
  stopListening() {
    // If this object doesn't have a uid it could potentially create problematic queries, so return.
    if (this.uid === undefined) return;
    // Remove all handlers for this messenger
    Fetch.getMessagesReference(this.uid).off();
  }
}

/**
 * Represents a single message
 * @export
 * @class Message
 */
export class Message {
  /**
   * Whether the message has been edited.
   * @type {Boolean}
   * @memberof Message
   */
  edited = false;
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
  /**
   * The text content of this message
   * @type {String}
   * @memberof MessageContent
   */
  bodyText = "";
  /**
   * The files that are mentioned in this message
   * @type {String[]}
   * @memberof MessageContent
   */
  files = [];
  /**
   * The events that are mentioned in this message.
   * @type {String[]}
   * @memberof MessageContent
   */
  events = [];
  /**
   * The changes that are mentioned in this message
   * @type {String[]}
   * @memberof MessageContent
   */
  histories = [];

  /**
   * Creates an instance of MessageContent.
   * @param  {MessageContent} args
   * @memberof MessageContent
   */
  constructor(args) {
    Object.assign(this, args);
  }
}
