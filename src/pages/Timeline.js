import React, { Component } from "react";
import { Timeline, Icon, Button } from "antd";
import TimelineEvent from "../classes/TimelineEvent";
import { Modal } from "antd";
import CreateEvent from "../forms/CreateEvent";
import TimelineItem from "../components/TimelineItem";
import Project from "../classes/Project";

export default class TIMELINE extends Component {
  static defaultProps = {
    project: {},
    user: {}
  };
  state = {
    project: {},
    user: {},
    eventCreatorVisible: false,
    eventCreatorKey: 0,
    events: []
  };
  componentWillReceiveProps(props) {
    this.setState({ user: props.user });
    if (Project.equal(props.project, this.state.project)) return;
    this.setState({
      project: props.project,
      events: props.project.getEventsInDateOrder()
    });
  }
  onExtrasButtonPress() {
    this.setState({ eventCreatorVisible: true });
  }
  render() {
    return (
      <div style={{ textAlign: "center" }}>
        {this.state.events && !!this.state.events.length ? (
          <Timeline style={{ maxWidth: 300, textAlign: "left" }}>
            {(() => {
              let events = this.state.events.map(item => ({
                date: item.date,
                item,
                type: "card"
              }));
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
                            onEdit={() => {}}
                            onComplete={() => {
                              this.state.project.setEvent(
                                data.item.uid,
                                Object.assign(data.item, {
                                  markedAsCompleted: true
                                })
                              );
                            }}
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
        ) : (
          <div style={{ opacity: 0.65, margin: 50, marginTop: "10vh" }}>
            <Icon type="calendar" />
            <br />
            <br />
            Your team's events will appear here.
            <br />
            <br />
          </div>
        )}
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
              this.state.project
                .addEvent(new TimelineEvent(e.values))
                .then(() => {
                  this.setState({
                    eventCreatorVisible: false,
                    eventCreatorKey: this.state.eventCreatorKey + 1
                  });
                });
            }}
          />
        </Modal>
      </div>
    );
  }
}
