import React, { Component } from "react";
import update from "immutability-helper";
import { Card, Icon, Button, List } from "antd";
import Columns from "react-columns";
import Messages, { Message, MessageContent } from "../classes/Messages";
import Project from "../classes/Project";
import $ from "../classes/Utils";
import "./Feed.css";

import UserGroupDisplay from "../components/UserGroupDisplay";
import MessageDisplay from "../components/MessageDisplay";
import TimelineItem from "../components/TimelineItem";
import ProjectIcon from "../components/ProjectIcon";
import HistoryDisplay from "../components/HistoryDisplay";

/**
 * The home page.
 * @export
 * @class FEED
 * @extends Component
 */
export default class FEED extends Component {
  state = {
    project: {}, // The current project.
    user: {}, // The current user.
    messenger: null, // The messenger to get messages from.
    messages: [], // All messages to render.
    totalHistoryRenderCount: 8 // The number of events to display at once.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.project &&
      Object.keys(this.state.project).length &&
      ((prevState.project || {}).history || []).length !== ((this.state.project || {}).history || []).length
    ) {
      // After every update, if the number history items changed, try to set all of the history items as read.
      this.state.project.trySetReadHistory();
    }
  }

  componentWillReceiveProps(props) {
    // Update this component with new properties.
    this.setState({
      project: props.project,
      user: props.user
    });
    if (!this.state.mesenger || this.state.messenger.uid !== props.project.messengerID) {
      // If we have a new messenger, configure the messenger to start listening, and remove the old one.
      if (this.state.messenger) {
        this.state.messenger.stopListening();
        this.state.messenger.off();
      }
      Messages.get(props.project.messengerID || props.project.projectID).then(messenger => {
        if (messenger) {
          this.setState(
            {
              messenger,
              // Sort the messages by time sent
              messages: $.object(messenger.messages)
                .values()
                .sort((a, b) => (a.timeSent || 0) - (b.timeSent || 0))
            },
            () => {
              // Configure the messenger to update the list of received messages as new messages arrive.
              messenger.on("message", msg => {
                if (!this.state.messages.find(x => x.uid === msg.uid))
                  this.setState(update(this.state, { messages: { $push: [msg] } }));
              });
              messenger.startListening();
            }
          );
        }
      });
    }
  }

  componentWillUnmount() {
    // Remove the messages listener.
    if (this.state.messenger) {
      this.state.messenger.stopListening();
      this.state.messenger.off();
    }
  }

  shouldComponentUpdate(props, state) {
    if (state.totalHistoryRenderCount && this.state.totalHistoryRenderCount !== state.totalHistoryRenderCount) return true;
    if (!Project.equal(props.project, this.state.project)) return true;
    if ((state.messages || []).length !== (this.state.messages || []).length) return true;
    // Don't update if no properties have changed.
    return false;
  }

  /**
   * Render all the unread messages.
   * @param  {any} project 
   * @param  {any} messages 
   * @return 
   * @memberof FEED
   */
  renderMessages(project, messages) {
    if (project && messages) {
      // Only show unread messages.
      let newMessages = messages.filter(item => !(item.readBy || {})[this.state.user.uid]).slice(0, 5);
      // Display the messages section if there are messages to display
      return messages.length && newMessages.length ? (
        <div>
          <h2
            style={{
              textTransform: "uppercase",
              opacity: 0.65,
              fontSize: 13
            }}
          >
            {"New Messages"}
          </h2>
          <br />
          <Card
            actions={[
              <span
                key={0}
                onClick={() => {
                  this.props.passMessage({
                    type: "navigate",
                    content: 3
                  });
                }}
              >
                <Icon type="export" />
                {" See all"}
              </span>
            ]}
          >
            <div style={{ margin: "-24px -24px" }}>
              <List itemLayout="vertical" className="messages">
                {newMessages.map(item => (
                  <MessageDisplay readOnly key={item.uid} message={item} project={this.state.project} user={this.state.user} />
                ))}
              </List>
            </div>
          </Card>
          <br />
        </div>
      ) : null;
    } else {
      return null;
    }
  }

  /**
   * Render all the upcoming events.
   * @param  {Project} project 
   * @return 
   * @memberof FEED
   */
  renderEvents(project) {
    if (project && project.events && project.events.length) {
      // Display only events that are not completed and 5 days away.
      let events = project
        .getEventsInDateOrder()
        .filter(item => item.date - Date.now() <= 5 * 1000 * 60 * 60 * 24 && item.date - Date.now() >= 0)
        .filter(item => !item.markedAsCompleted);
      // Display the events if there are any.
      if (events.length) {
        return (
          <div>
            <h2
              style={{
                textTransform: "uppercase",
                opacity: 0.65,
                fontSize: 13
              }}
            >
              {"Upcoming Events"}
            </h2>
            <br />
            {events.map(item => (
              <div key={item.uid}>
                <TimelineItem
                  user={this.state.user}
                  onMentionButtonPressed={() => {
                    this.props.passMessage({
                      type: "prepare-message",
                      content: new Message({
                        readBy: { [this.state.user.uid]: true },
                        sender: this.state.user.uid,
                        content: new MessageContent({
                          events: [item.uid],
                          bodyText: "(Mentioned an event)"
                        })
                      })
                    });
                  }}
                  onComplete={() => {
                    this.state.project.setEvent(
                      item.uid,
                      Object.assign(item, {
                        markedAsCompleted: true
                      }),
                      true
                    );
                  }}
                  project={this.state.project}
                  event={item}
                />
                <br />
              </div>
            ))}
            <br />
          </div>
        );
      }
    }
  }

  /**
   * The number of history items to load at once
   * @type {Number }
   * @memberof FEED
   */
  renderBatchSize = 8;

  renderChanges() {
    return (
      <div>
        <h2
          style={{
            textTransform: "uppercase",
            opacity: 0.65,
            fontSize: 13
          }}
        >
          {"Changes"}
        </h2>
        <br />
        <Columns
          rootStyles={{ maxWidth: 950, margin: "auto" }}
          gap={10}
          queries={[
            {
              columns: Math.min((this.state.project.history || []).length || 1, 2),
              query: "min-width: 1000px"
            }
          ]}
        >
          {(this.state.project.history || [])
            // Make a copy of the list of history items.
            .slice()
            // Sort the items by date descending.
            .sort((a, b) => (b.doneAt || 0) - (a.doneAt || 0))
            // Limit the number of items to display to the total render count defined by this component.
            .slice(0, Math.min((this.state.project.history || []).length, this.state.totalHistoryRenderCount))
            .map(item => (
              <div key={item.uid}>
                <HistoryDisplay
                  user={this.state.user}
                  project={this.state.project}
                  item={item}
                  onMessage={msg => {
                    this.props.passMessage(msg);
                  }}
                  onMentionButtonPressed={() => {
                    this.props.passMessage({
                      type: "prepare-message",
                      content: new Message({
                        readBy: { [this.state.user.uid]: true },
                        sender: this.state.user.uid,
                        content: new MessageContent({
                          histories: [item.uid],
                          bodyText: "(Mentioned a change)"
                        })
                      })
                    });
                  }}
                />{" "}
                <br />
              </div>
            ))}
        </Columns>
        {this.state.totalHistoryRenderCount < (this.state.project.history || []).length ? (
          <Button
            icon="down"
            style={{
              margin: "auto",
              background: "transparent"
            }}
            onClick={() => {
              this.setState({
                totalHistoryRenderCount: this.state.totalHistoryRenderCount + this.renderBatchSize
              });
            }}
          >
            More
          </Button>
        ) : (
          <div style={{ opacity: 0.65, margin: 50, marginBottom: 0 }}>Nothing else to show.</div>
        )}
      </div>
    );
  }

  render() {
    let msgs = this.renderMessages(this.state.project, this.state.messages);
    let events = this.renderEvents(this.state.project);
    return (
      <div
        style={{
          textAlign: "center"
        }}
      >
        <div
          style={{
            textAlign: "left",
            maxWidth: 500,
            margin: "auto",
            padding: 10
          }}
        >
          {/* Render the project icon */}
          <ProjectIcon name={this.state.project.name} style={{ margin: -5 }} readOnly />
          {/* Render the project name */}
          <h2 style={{ fontWeight: 700, fontSize: 20, marginTop: 10 }}>{this.state.project.name}</h2>
          {!!this.state.project.description && (
            // Render the project description.
            <p style={{ opacity: 0.65 }}>
              {this.state.project.description}
              <br />
            </p>
          )}
          {this.state.project.creator ? (
            // Render the project creator.
            <div style={{ marginTop: 10 }}>
              <span style={{ opacity: 0.65 }}>Created by </span>
              <UserGroupDisplay
                style={{ display: "inline-block" }}
                people={{ members: [this.state.project.creator] }}
                project={this.state.project}
              />
            </div>
          ) : (
            ""
          )}
        </div>
        <br />
        {events && msgs ? (
          <Columns
            rootStyles={{ maxWidth: 950, margin: "auto" }}
            gap={10}
            queries={[
              {
                columns: Math.min((this.state.project.history || []).length || 1, 2),
                query: "min-width: 1000px"
              }
            ]}
          >
            {/* Render the unread messages */}
            <div>{msgs}</div>
            {/* Render the upcoming events */}
            <div>{events}</div>
          </Columns>
        ) : (
          <div>
            {/* Render the two as a single column */}
            {msgs} {events}
          </div>
        )}
        {/* Render history events */}
        {this.renderChanges()}
        <br />
      </div>
    );
  }
}
