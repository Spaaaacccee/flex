import React, { Component } from "react";
import { Timeline, Icon, Button } from "antd";
import TimelineEvent from "../classes/TimelineEvent";
import { Modal } from "antd";
import CreateEvent from "../forms/CreateEvent";
import TimelineItem from "../components/TimelineItem";

export default class TIMELINE extends Component {
  static defaultProps = {
    project: {},
    user: {}
  };
  state = {
    project: {},
    user: {},
    eventCreatorVisible: false,
    eventCreatorKey:0
  };
  componentWillReceiveProps(props) {
    this.setState({ project: props.project, user: props.user });
  }
  onExtrasButtonPress() {
    this.setState({ eventCreatorVisible: true });
  }
  render() {
    return (
      <div style={{ textAlign: "center" }}>
        <Timeline style={{ maxWidth: 300, textAlign: "left" }}>
          {this.state.project.events &&
            (() => {
              let events = this.state.project
                .getEventsInDateOrder()
                .map(item => ({ date: item.date, item, type: "card" }));
              let dateNow = Date.now();
              events.splice(
                events.map(item => item.date <= dateNow).lastIndexOf(true) + 1,
                0,
                { date: dateNow, item: { name: "Today" }, type: "marker" }
              );
              return events.map((data, index) => (
                <Timeline.Item key={index}>
                  {(() => {
                    switch (data.type) {
                      case "card":
                        return (
                          <TimelineItem
                            eventID={data.item.uid}
                            projectID={this.state.project.projectID}
                          />
                        );
                        break;
                      case "marker":
                        return (
                          <div>
                            {`${data.item.name} (${new Date(
                              data.date
                            ).toDateString()})`}
                          </div>
                        );
                      default:
                        break;
                    }
                  })()}
                </Timeline.Item>
              ));
            })()}
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
          key={this.state.eventCreatorKey}
            project={this.state.project}
            opened={this.state.eventCreatorVisible}
            onSubmit={e => {
              this.state.project.addEvent(new TimelineEvent(e.values)).then(()=>{
                this.setState({ eventCreatorVisible: false,eventCreatorKey:this.state.eventCreatorKey+1 });
              });
              
            }}
          />
        </Modal>
      </div>
    );
  }
}
