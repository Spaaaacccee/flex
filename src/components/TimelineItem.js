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
    project: {},
    event: {},
    eventEditorVisible: false,
    frozen: false
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({ event: props.event, project: props.project });
  }

  shouldComponentUpdate(props, state) {
    // If the new properties are not different to the values in the existing state, then don't update anything.
    if (this.state.frozen !== state.frozen) return true;
    if (this.state.project !== state.project) return true;
    if (this.state.event !== state.event) return true;
    if (this.state.eventEditorVisible !== state.eventEditorVisible) return true;
    if (!Project.equal(props.project, this.state.project)) return true;
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
            this.state.event.uid
              ? isComplete
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
            style={isComplete ? { textDecoration: "line-through" } : {}}
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
              this.state.project
                .setEvent(this.state.event.uid, new TimelineEvent(event.values))
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
