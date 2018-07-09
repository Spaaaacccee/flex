import React, { Component } from "react";
import { Timeline, Icon, Button } from "antd";
import TimelineEvent from "../classes/TimelineEvent";
import { Modal } from "antd";
import CreateEvent from "../forms/CreateEvent";

export default class Page_Timeline extends Component {
  static defaultProps = {
    project: {},
    user: {}
  };
  state = {
    project: {},
    user: {},
    eventCreatorVisible: false
  };
  componentWillReceiveProps(props) {
    this.setState({ project: props.project, user: props.user });
  }
  render() {
    return (
      <div>
        <Timeline>
          {this.state.project.events &&
            this.state.project.events.map((item, index) => (
              <Timeline.Item key={index}>
                <TimelineEvent
                  eventID={item.eventID}
                  projectID={this.state.project.projectID}
                />
              </Timeline.Item>
            ))}
        </Timeline>
        <Button
          type="primary"
          icon="plus"
          onClick={() => {
            this.setState({ eventCreatorVisible: true });
          }}
        >
          Event
        </Button>
        <Modal
          footer={null}
          style={{ top: 20 }}
          visible={this.state.eventCreatorVisible}
          onCancel={() => {
            this.setState({ eventCreatorVisible: false });
          }}
        >
          <CreateEvent />
        </Modal>
      </div>
    );
  }
}
