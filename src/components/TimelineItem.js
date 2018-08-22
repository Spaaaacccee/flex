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
    onEdit: () => {},
    onMentionButtonPressed: () => {}
  };
  state = {
    project: {},
    user: {},
    event: {},
    eventEditorVisible: false,
    frozen: false,
    readOnly: false
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
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
    if (JSON.stringify(props.event) !== JSON.stringify(this.state.event))
      return true;
    return false;
  }

  render() {
    const isComplete =
      this.state.event.markedAsCompleted ||
      (this.state.event.autoComplete && this.state.event.date <= Date.now());
    return (
      <div
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
                  <span
                    onClick={() => {
                      this.setState({ eventEditorVisible: true });
                      this.props.onEdit();
                    }}
                  >
                    <Icon type="edit" />
                    {" Edit"}
                  </span>,
                  <span
                    onClick={() => {
                      this.props.onMentionButtonPressed();
                    }}
                  >
                    <Icon type="message" />
                    {" Mention"}
                  </span>,
                  ...(!isComplete
                    ? [
                        <span
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
                    <div style={{ marginBottom: 10 }}>
                      <Icon type="check" />
                      {" complete"}
                    </div>
                  )}
                  {!isComplete &&
                    (UserGroupDisplay.hasUser(
                      this.state.event.involvedPeople,
                      this.state.project,
                      this.state.user
                    ) ||
                      this.state.event.creator === this.state.user.uid) && (
                      <div style={{ marginBottom: 10, color: "#FFD800" }}>
                        <Icon type="user" />
                        {" You're involved"}
                      </div>
                    )}
                  {!isComplete &&
                    new Moment(this.state.event.date).diff(
                      new Moment(),
                      "days"
                    ) <= 14 &&
                    new Moment(this.state.event.date).diff(
                      new Moment(),
                      "days"
                    ) >= 0 && (
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
                <span>{this.state.event.name}</span>
              </span>
            }
            description={
              this.state.event.date ? (
                <div>
                  <div>
                    <div>{new Date(this.state.event.date).toDateString()}</div>
                    <div>{this.state.event.description || ""}</div>
                    <br />
                  </div>
                  <div>
                    <UserGroupDisplay
                      project={this.state.project}
                      people={this.state.event.involvedPeople}
                    />
                    {this.state.event.creator ? (
                      <div>
                        Creator:{" "}
                        <UserGroupDisplay
                          style={{display:'inline-block'}}
                          project={this.state.project}
                          people={{ members: [this.state.user.uid] }}
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
        <Modal
          footer={null}
          style={{ top: 20 }}
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
                .setEvent(
                  this.state.event.uid,
                  new TimelineEvent(
                    Object.assign(this.state.event, event.values)
                  )
                )
                .then(() => {
                  this.setState({
                    event: event.values,
                    eventEditorVisible: false
                  });
                });
            }}
            onDelete={() => {
              this.setState(
                {
                  frozen: true,
                  event: update(this.state.event, {
                    markedAsCompleted: { $set: true }
                  }),
                  eventEditorVisible: false
                },
                () => {
                  this.state.project.deleteEvent(this.state.event.uid);
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
