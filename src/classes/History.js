import $ from "./Utils";

export default class History {}

export class HistoryItem {
  /**
   * @type {String}
   * @memberof HistoryItem
   */
  uid = $.id().generateUID();
  /**
   * @type {"added" | "removed" | "edited"}
   * @memberof HistoryItem
   */
  action;
  /**
   * @type {"description" | "name" | "message" | "event" | "file" | "member"}
   * @memberof HistoryItem
   */
  type;
  /**
   * @type {HistoryItemContent}
   * @memberof HistoryItem
   */
  content = new HistoryItemContent({});
  /**
   * @type {String | null}
   * @memberof HistoryItem
   */
  doneBy;
  /**
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

export class HistoryItemContent {
  /**
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
