import React, { Component } from "react";
import { Card, Icon, Button, Modal } from "antd";
import Project from "../classes/Project";
import UserGroupDisplay from "./UserGroupDisplay";
import update from "immutability-helper";
import CreateEvent from "../forms/CreateEvent";
import TimelineEvent from "../classes/TimelineEvent";

/**
 * Displays an timeline event as a card
 * @export
 * @class TimelineItem
 * @extends Component
 */
export default class TimelineItem extends Component {
  static defaultProps = {
    onComplete: () => {},
    onEdit: () => {}
  };
  state = {
    eventID: null, //TimelineEvent uid to display
    projectID: null, //The ID of the project to take the event info from
    project: {},
    event: {},
    eventEditorVisible: false
  };

  componentWillReceiveProps(props) {
    this.setState({ eventID: props.eventID, projectID: props.projectID });
    if (!props.projectID) return;
    Project.get(props.projectID).then(project => {
      if (!project) return;
      this.setState({ project });
      if (!props.eventID) return;
      let event = project.events.find(item => item.uid === props.eventID);
      if (event) this.setState({ event });
    });
  }

  render() {
    return (
      <div style={{ textAlign: "left" }}>
        <Card
          style={this.state.event.markedAsCompleted ? { opacity: 0.65 } : {}}
          actions={
            this.state.event.name
              ? this.state.event.markedAsCompleted
                ? [
                    <Icon
                      type="edit"
                      onClick={() => {
                        this.setState({ eventEditorVisible: true });
                        this.props.onEdit();
                      }}
                    />
                  ]
                : [
                    <Icon
                      type="edit"
                      onClick={() => {
                        this.setState({ eventEditorVisible: true });
                        this.props.onEdit();
                      }}
                    />,
                    <Icon
                      type="check"
                      onClick={() => {
                        this.props.onComplete();
                        this.setState(
                          update(this.state, {
                            event: { markedAsCompleted: { $set: true } }
                          })
                        );
                      }}
                    />
                  ]
              : null
          }
        >
          <Card.Meta
            style={
              this.state.event.markedAsCompleted
                ? { textDecoration: "line-through" }
                : {}
            }
            title={this.state.event.name || <Icon type="loading" />}
            description={
              this.state.event.date ? (
                <div>
                  <div>{new Date(this.state.event.date).toDateString()}</div>
                  <div>{this.state.event.description || ""}</div>
                  <div>
                    <br />
                    <UserGroupDisplay
                      project={this.state.project}
                      people={this.state.event.involvedPeople}
                    />
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
              this.setState({ event: event.values, eventEditorVisible: false });
              this.state.project.setEvent(
                this.state.event.uid,
                new TimelineEvent(event.values)
              );
            }}
            values={this.state.event}
          />
        </Modal>
      </div>
    );
  }
}
