import { IDGen, EventEmitter } from "./Utils";
import React, { Component } from "react";
import Fetch from "./Fetch";

/**
 * A collection of messages
 * @export
 * @class Messages
 */
export default class Messages extends EventEmitter {
  /**
   * Gets a message collection, alias to `Fetch.getMessages`
   * @static
   * @param  {any} collectionID
   * @return
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

  uid = IDGen.generateUID();

  lastUpdatedTimestamp = Date.now();

  /**
   * All messages, indexed by uid
   * @type {Object}
   * @memberof Messages
   */
  messages = {};

  /**
   * @param {{<Function>}} operation
   * @return {Promise<Boolean>}
   * @memberof Messages
   */
  async transaction(operation) {
    let dateNow = Date.now();
    try {
      // Perform the operation on the database object
      await Fetch.getMessagesReference(this.uid).transaction(item => {
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

  async addMessage(message) {
    await this.transaction(function() {
      this.messages = this.messages || [];
      this.messages[message.uid] = message;
    });
  }

  startListening() {
    if (this.uid === undefined) return;
    Fetch.getMessagesReference(this.uid).child('messages').on("child_added", snapshot => {
      const message = snapshot.val();
      this.messages = this.messages || {};
      this.messages[message.uid] = message;
      this.emit("message", message);
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
  uid = IDGen.generateUID();
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
   * Creates an instance of Message.
   * @param  {Message} args
   * @memberof Message
   */
  constructor(args) {
    if (args.content) args.content = new MessageContent(args.content);
    Object.assign(this, args);
  }
}

class MessageContent {
  bodyText = "";
  fileID = "";
  eventID = "";
  people = { members: [], roles: [] };
  /**
   * Creates an instance of MessageContent.
   * @param  {MessageContent} args
   * @memberof MessageContent
   */
  constructor(args) {
    Object.assign(this, args);
  }
}
