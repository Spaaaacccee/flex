import { IDGen } from "./Utils";

export default class TimelineEvent {
  /**
   * Name of the event
   * @type {String}
   * @memberof TimelineEvent
   */
  name;
  /**
   * Unique ID to uniquely identify this event
   * @type {String}
   * @memberof TimelineEvent
   */
  uid = IDGen.generateUID();
  /**
   * A simple description of this event
   * @type {String}
   * @memberof TimelineEvent
   */
  description;
  /**
   * The uid of the user that created this event
   * @type {String}
   * @memberof TimelineEvent
   */
  creator;
  /**
   * The date that this event takes place
   * @type {Number}
   * @memberof TimelineEvent
   */
  date;
  /**
   * The date that the event was created
   * @type {Number}
   * @memberof TimelineEvent
   */
  created = Date.now();
  /**
   * When to notify the members of this event (the number of days relative before the event)
   *
   * Set this to null or -1 to signify that no notification shall be needed
   * @type {Number}
   * @memberof TimelineEvent
   */
  notify = 0;
  /**
   * A list of uids of roles AND members that are involved in this event
   * @type {Array<String>}
   * @memberof TimelineEvent
   */
  involvedPeople = [];

  /**
   * Whether the event should be considered as completed when the date has passed
   * @type {Boolean}
   * @memberof TimelineEvent
   */
  autoComplete = false;

  /**
   * Whether this event has been manually marked as completed
   * @type {Boolean}
   * @memberof TimelineEvent
   */
  markedAsCompleted = false;

  /**
   * Creates an instance of TimelineEvent.
   * @param  {Object} params any of the aforementioned properties
   * @memberof TimelineEvent
   */
  constructor(params) {
    this.created = Date.now();
    Object.assign(this, params);
  }
}
