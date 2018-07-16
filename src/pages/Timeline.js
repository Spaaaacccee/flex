import React, { Component } from "react";
import { Timeline, Icon, Button } from "antd";
import TimelineEvent from "../classes/TimelineEvent";
import { Modal } from "antd";
import CreateEvent from "../forms/CreateEvent";
import TimelineItem from "../components/TimelineItem";

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
      <div style={{textAlign:'center'}}>
        <Timeline style={{maxWidth:300,textAlign:'left'}}>
          {this.state.project.events &&
            this.state.project.events.map((item, index) => (
              <Timeline.Item key={index}>
                <TimelineItem
                  eventID={item.uid}
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
          <CreateEvent
            opened={this.state.eventCreatorVisible}
            onSubmit={e => {
              this.state.project.addEvent(new TimelineEvent(e.values));
              this.setState({ eventCreatorVisible: false });
            }}
          />
        </Modal>
      </div>
    );
  }
}
