import $ from "./Utils";
import User from "./User";

/**
 * Represents a change made to a project.
 * @export
 * @class HistoryItem
 */
export class HistoryItem {
  /**
   * Generate a single sentence description of an event.
   * @static
   * @param {HistoryItem} item
   * @param {Boolean} includeTime
   * @param {Boolean} includeName
   * @param {User} user
   * @return
   * @memberof HistoryItem
   */
  static getDescription(item, includeTime, includeName, user) {
    // Generate the body text, starting with the name of the who did this event.
    return `${includeName ? `${user.name} ` : ""}${item.action} ${
      // If the change is made on the name or description of the project, prepend the action with "the project" e.g. John edited the project description
      item.type === "name" || item.type === "description" || item.type === "roles"
        ? "the project"
        : // If the change is made on the project, prepend it with "this" e.g. John joined this project
          item.type === "project"
          ? "this"
          : // Otherwise, the change is made on an item in this project, so select an indefinite article accordingly e.g. John created an event, John added a file
            $.string(item.type.substring(0, 1)).isVowel()
            ? "an"
            : "a"
    } ${item.type}${
      // If include time is true, append the time this change was made.
      includeTime ? `  ${$.date(item.doneAt).humanise(true)}` : ""
    }`;
  }

  /**
   * Async wrapper around get description if you don't want to supply user information manually.
   * @static
   * @param {HistoryItem} item
   * @param {Boolean} includeTime
   * @param {Boolean} includeName
   * @return
   * @memberof HistoryItem
   */
  static async getDescriptionAsync(item, includeTime, includeName) {
    return await HistoryItem.getDescription(
      item,
      includeTime,
      includeName,
      await User.get(item.doneBy)
    );
  }

  /**
   * @type {String}
   * @memberof HistoryItem
   */
  uid = $.id().generateUID();

  /**
   * The action that was performed.
   * @type {"added" | "removed" | "edited"}
   * @memberof HistoryItem
   */
  action;

  /**
   * The type of item that the action was performed on.
   * @type {"description" | "name" | "message" | "event" | "file" | "member"}
   * @memberof HistoryItem
   */
  type;

  /**
   * Details of the action.
   * @type {HistoryItemContent}
   * @memberof HistoryItem
   */
  content = new HistoryItemContent({});
  /**
   * The uid of the user that performed the action.
   * @type {String | null}
   * @memberof HistoryItem
   */
  doneBy;

  /**
   * The people who has read this history item.
   * @type {Object.<String, Number>}
   * @memberof HistoryItem
   */
  readBy = [];

  /**
   * The time when this history item was created / the time this action was done
   * @type {Number}
   * @memberof HistoryItem
   */
  doneAt = Date.now();

  /**
   * Creates an instance of HistoryItem.
   * @param  {HistoryItem} args
   * @memberof HistoryItem
   */
  constructor(args) {
    Object.assign(this, args);
  }
}

/**
 * The details of a change.
 * @export
 * @class HistoryItemContent
 */
export class HistoryItemContent {
  /**
   * The uid of the event, file, etc that changed occured on.
   * @type {String}
   * @memberof HistoryItemContent
   */
  uid;

  /**
   * Additional data to go along with this history item
   * @type {Object || null}
   * @memberof HistoryItemContent
   */
  bodyContent;

  /**
   * Creates an instance of HistoryItemContent.
   * @param  {HistoryItemContent} args
   * @memberof HistoryItemContent
   */
  constructor(args) {
    Object.assign(this, args);
  }
}
