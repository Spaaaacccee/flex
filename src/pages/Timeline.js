import React, { Component } from "react";
import { Timeline, Icon, Button } from "antd";
import TimelineEvent from "../classes/TimelineEvent";
import { Modal } from "antd";
import CreateEvent from "../forms/CreateEvent";
import TimelineItem from "../components/TimelineItem";
import Project from "../classes/Project";
import update from "immutability-helper";
import { Message, MessageContent } from "../classes/Messages";

/**
 * The timeline page.
 * @export
 * @class TIMELINE
 * @extends Component
 */
export default class TIMELINE extends Component {
  static defaultProps = {
    project: {},
    user: {}
  };
  state = {
    project: {}, // The source project. 
    user: {}, // The current user.
    eventCreatorVisible: false, // Whether the create event window is open.
    events: [] // The events to display.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Update this component to match its properties.
    this.setState({
      user: props.user,
      project: props.project
    });
    if (props.project && props.project.getEventsInDateOrder) {
      // Get all of the events in date order and save it to this component.
      this.setState({ events: props.project.getEventsInDateOrder() });
    } else {
      this.setState({ events: [] });
    }
  }

  shouldComponentUpdate(props, state) {
    if (this.state.eventCreatorVisible !== state.eventCreatorVisible) return true;
    if (this.state.project !== state.project) return true;
    if (this.state.user !== state.user) return true;
    if (!Project.equal(props.project, this.state.project)) return true;
    if (JSON.stringify(props.project.getEventsInDateOrder()) !== JSON.stringify(this.state.events)) return true;
    // If no properties have changed then don't update.
    return false;
  }

  onExtrasButtonPress() {
    // When the extras button is pressed, open the event creator.
    this.setState({ eventCreatorVisible: true });
  }
  render() {
    return (
      <div style={{ textAlign: "center" }}>
        {this.state.events && !!this.state.events.length ? (
          <Timeline style={{ maxWidth: 500, textAlign: "left" }}>
            {(() => {
              let events = this.state.events.map((item, index) => ({
                date: item.date,
                item,
                type: "card",
                index
              }));
              let dateNow = Date.now();
              events.splice(events.map(item => item.date <= dateNow).lastIndexOf(true) + 1, 0, {
                date: dateNow,
                item: { name: "Today" },
                type: "marker"
              });
              return events.map((data, index) => (
                <Timeline.Item key={data.item.uid + index}>
                  {(() => {
                    switch (data.type) {
                      case "card":
                        return (
                          <TimelineItem
                            onMentionButtonPressed={() => {
                              this.props.passMessage({
                                type: "prepare-message",
                                content: new Message({
                                  readBy: { [this.state.user.uid]: true },
                                  sender: this.state.user.uid,
                                  content: new MessageContent({
                                    events: [data.item.uid],
                                    bodyText: "(Mentioned an event)"
                                  })
                                })
                              });
                            }}
                            onComplete={() => {
                              this.setState(
                                update(this.state, {
                                  events: {
                                    [data.index]: {
                                      $merge: { markedAsCompleted: true }
                                    }
                                  }
                                })
                              );
                              this.state.project.setEvent(
                                data.item.uid,
                                Object.assign(data.item, {
                                  markedAsCompleted: true
                                }),
                                true
                              );
                            }}
                            user={this.state.user}
                            event={data.item}
                            project={this.state.project}
                          />
                        );
                      case "marker":
                        return <div>{`${data.item.name} (${new Date(data.date).toDateString()})`}</div>;
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
            {"Your team's events will appear here."}
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
          destroyOnClose
          getContainer={()=>document.querySelector(".modal-mount > div:first-child")}
          footer={null}
          style={{ top: 20 }}
          visible={this.state.eventCreatorVisible}
          onCancel={() => {
            this.setState({ eventCreatorVisible: false });
          }}
        >
          <CreateEvent
            project={this.state.project}
            opened={this.state.eventCreatorVisible}
            onSubmit={e => {
              let newEvent = new TimelineEvent({
                ...e.values,
                creator: this.state.user.uid
              });
              this.setState(
                update(this.state, {
                  events: {
                    $splice: [[this.state.events.map(item => item.date <= Date.now()).lastIndexOf(true) + 1, 0, newEvent]]
                  }
                })
              );
              this.state.project.addEvent(newEvent).then(() => {
                this.setState({
                  eventCreatorVisible: false
                });
              });
            }}
          />
        </Modal>
      </div>
    );
  }
}
