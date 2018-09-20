import React, { Component } from "react";
import { Card, Icon, Button, Modal } from "antd";
import Project from "../classes/Project";
import UserGroupDisplay from "./UserGroupDisplay";
import update from "immutability-helper";
import CreateEvent from "../forms/CreateEvent";
import TimelineEvent from "../classes/TimelineEvent";
import Moment from "moment";
import User from "../classes/User";

/**
 * Displays an timeline event as a card
 * @export
 * @class TimelineItem
 * @extends Component
 */
export default class TimelineItem extends Component {
  static defaultProps = {
    onComplete: () => {},
    onMentionButtonPressed: () => {}
  };
  state = {
    project: {}, // The project associated wth this item.
    user: {}, // The current user.
    event: {}, // The event to display.
    eventEditorVisible: false, // Whether the edit window is visible.
    frozen: false, // Whether the user should be able to interact with this item.
    readOnly: false // Whether the item is read only.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Update this component with new properties.
    this.setState({
      event: props.event,
      project: props.project,
      user: props.user,
      readOnly: !!props.readOnly
    });
  }

  shouldComponentUpdate(props, state) {
    // If the new properties are not different to the values in the existing state, then don't update anything.
    if (this.state.frozen !== state.frozen) return true;
    if (this.state.project !== state.project) return true;
    if (this.state.user !== state.user) return true;
    if (this.state.event !== state.event) return true;
    if (!this.state.readOnly !== !props.readOnly) return true;
    if (!this.state.readOnly !== !state.readOnly) return true;
    if (this.state.eventEditorVisible !== state.eventEditorVisible) return true;
    if (!Project.equal(props.project, this.state.project)) return true;
    if (!User.equal(state.user, this.state.user)) return true;
    if (JSON.stringify(props.event) !== JSON.stringify(this.state.event)) return true;
    return false;
  }

  render() {
    // To be complete is to mean that either the event is marked as complete or is marked as to be completed automatically and the date has passed.
    const isComplete =
      this.state.event.markedAsCompleted || (this.state.event.autoComplete && this.state.event.date <= Date.now());
    return (
      <div
        // Set user interaction to none is this componenent is frozen.
        style={{
          textAlign: "left",
          pointerEvents: this.state.frozen ? "none" : "all"
        }}
      >
        <Card
          style={isComplete ? { opacity: 0.65 } : {}}
          actions={
            this.state.event.uid && !this.state.readOnly
              ? [
                  // An edit button
                  <span
                    key={0}
                    onClick={() => {
                      // Open the event editor.
                      this.setState({ eventEditorVisible: true });
                    }}
                  >
                    <Icon type="edit" />
                    {" Edit"}
                  </span>,
                  <span
                    key={1}
                    onClick={() => {
                      // Notify the parent component that the mention button is pressed.
                      this.props.onMentionButtonPressed();
                    }}
                  >
                    <Icon type="message" />
                    {" Mention"}
                  </span>,
                  ...(!isComplete
                    ? [
                        // Display the mark as completed button if the event has yet to be completed.
                        <span
                          key={3}
                          onClick={() => {
                            this.props.onComplete();
                            this.setState(
                              update(this.state, {
                                event: { markedAsCompleted: { $set: true } }
                              })
                            );
                          }}
                        >
                          <Icon type="check" />
                          {" Complete"}
                        </span>
                      ]
                    : [])
                ]
              : null
          }
        >
          <Card.Meta
            title={
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 700
                }}
              >
                <span
                  style={{
                    fontWeight: "bold",
                    fontSize: 13,
                    textTransform: "uppercase"
                  }}
                >
                  {isComplete && (
                    // Display a tick if the item is completed.
                    <div style={{ marginBottom: 10 }}>
                      <Icon type="check" />
                      {" complete"}
                    </div>
                  )}
                  {!isComplete &&
                    // Display a You're Involved phrase if the item is not complete and the current user is involved.
                    (UserGroupDisplay.hasUser(this.state.event.involvedPeople, this.state.project, this.state.user) ||
                      this.state.event.creator === this.state.user.uid) && (
                      <div style={{ marginBottom: 10, color: "#FFD800" }}>
                        <Icon type="user" />
                        {" You're involved"}
                      </div>
                    )}
                  {!isComplete &&
                    // Display a relative date if the event is within a week of today.
                    this.state.event.date + (1000 * 60 * 60 * 24 - 1) - Date.now() <= 1000 * 60 * 60 * 24 * 7 &&
                    this.state.event.date + (1000 * 60 * 60 * 24 - 1) - Date.now() >= 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <Icon type="clock-circle-o" />{" "}
                        {Moment(this.state.event.date).calendar(null, {
                          sameDay: "[Today]",
                          nextDay: "[Tomorrow]",
                          nextWeek: "[Upcoming] dddd",
                          lastDay: "[Yesterday]",
                          lastWeek: "[Last] dddd",
                          sameElse: "DD/MM/YYYY"
                        })}
                      </div>
                    )}
                </span>
                {/* Display the event name */}
                <span>{this.state.event.name}</span>
              </span>
            }
            description={
              this.state.event.date ? (
                // Display the event date and description.
                <div>
                  <div>
                    <div>{new Date(this.state.event.date).toDateString()}</div>
                    <div>{this.state.event.description || ""}</div>
                    <br />
                  </div>
                  <div>
                    {/* Display the people involved */}
                    <UserGroupDisplay project={this.state.project} people={this.state.event.involvedPeople} />
                    {this.state.event.creator ? (
                      // Display the creator of this event
                      <div>
                        Creator:{" "}
                        <UserGroupDisplay
                          style={{ display: "inline-block" }}
                          project={this.state.project}
                          people={{ members: [this.state.event.creator] }}
                        />
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              ) : (
                <Icon type="loading" />
              )
            }
          />
        </Card>
        {/* The edit event modal */}
        <Modal
          destroyOnClose
          getContainer={() => document.querySelector(".modal-mount > div:first-child")}
          footer={null}
          visible={this.state.eventEditorVisible}
          onCancel={() => {
            this.setState({ eventEditorVisible: false });
          }}
        >
          <CreateEvent
            project={this.state.project}
            opened={this.state.eventEditorVisible}
            mode="edit"
            onSubmit={event => {
              this.state.project
                .setEvent(this.state.event.uid, new TimelineEvent({ ...this.state.event, ...event.values }))
                .then(() => {
                  this.setState({
                    event: event.values,
                    eventEditorVisible: false
                  });
                });
            }}
            onDelete={() => {
              // What to do when the user deletes an event

              // Set this component as frozen, and mark it as complete to prevent user interaction.
              this.setState(
                {
                  frozen: true,
                  event: update(this.state.event, {
                    markedAsCompleted: { $set: true }
                  }),
                  eventEditorVisible: false
                },
                () => {
                  // Delete the event. A delay is set to smooth out the animation.
                  setTimeout(() => {
                    this.state.project.deleteEvent(this.state.event.uid);
                  }, 250);
                }
              );
            }}
            values={this.state.event}
          />
        </Modal>
      </div>
    );
  }
}
