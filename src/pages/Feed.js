import React, { Component } from "react";

import Fire from "../classes/Fire";
import $ from "../classes/Utils";
import "./Feed.css";

import { Card, Icon, Avatar, Button, List } from "antd";
import Messages, { Message, MessageContent } from "../classes/Messages";
import formatJSON from "format-json-pretty";
import Project from "../classes/Project";
import User from "../classes/User";
import UserGroupDisplay from "../components/UserGroupDisplay";
import MessageDisplay from "../components/MessageDisplay";
import TimelineItem from "../components/TimelineItem";
import FileDisplay from "../components/FileDisplay";
import Moment from "moment";
import ProjectDisplay from "../components/ProjectDisplay";
import ProjectIcon from "../components/ProjectIcon";
import update from "immutability-helper";
import Columns from "react-columns";
import HistoryDisplay from "../components/HistoryDisplay";

const { Meta } = Card;

export default class FEED extends Component {
  /**
   * @type {{project:Project,user:User}}
   * @memberof FEED
   */
  state = {
    project: {},
    user: {},
    messenger: null,
    messages: [],
    totalHistoryRenderCount: 8
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
      this.state.project.trySetReadHistory();
    }
  }

  componentWillReceiveProps(props) {
    this.setState({
      project: props.project,
      user: props.user
    });
    if (!this.state.mesenger || this.state.messenger.uid !== props.project.messengerID) {
      Messages.get(props.project.messengerID || props.project.projectID).then(messenger => {
        if (messenger) {
          this.setState(
            {
              messenger,
              messages: $.object(messenger.messages)
                .values()
                .sort((a, b) => a.timeSent || 0 - b.timeSent || 0)
            },
            () => {
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
    if (this.state.messenger) this.state.messenger.off();
  }

  shouldComponentUpdate(props, state) {
    if (state.totalHistoryRenderCount && this.state.totalHistoryRenderCount !== state.totalHistoryRenderCount) return true;
    if (!Project.equal(props.project, this.state.project)) return true;
    if ((state.messages || []).length !== (this.state.messages || []).length) return true;
    return false;
  }

  renderMessages(project, messages) {
    if (project && messages) {
      let newMessages = messages.filter(item => !(item.readBy || {})[this.state.user.uid]).slice(0, 5);
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

  renderEvents(project) {
    if (project && project.events && project.events.length) {
      let events = project
        .getEventsInDateOrder()
        .filter(
          item => new Moment(item.date).diff(new Moment(), "days") <= 5 && new Moment(item.date).diff(new Moment(), "days") >= 0
        )
        .filter(item => !item.markedAsCompleted);
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
            {events.map((item, index) => (
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
            .slice()
            .sort((a, b) => b.doneAt || 0 - a.doneAt || 0)
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
            icon="sync"
            style={{
              margin: "auto"
            }}
            onClick={() => {
              this.setState({
                totalHistoryRenderCount: this.state.totalHistoryRenderCount + this.renderBatchSize
              });
            }}
          >
            Load More
          </Button>
        ) : (
          <div style={{ opacity: 0.65, margin: 50, marginBottom: 0 }}>Nothing else to show.</div>
        )}
      </div>
    );
  }

  async getContent(project) {
    //let messages = (await Messages.get(project.messengerID)).;
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
          <ProjectIcon name={this.state.project.name} style={{ margin: -5 }} readOnly />
          <h2 style={{ fontWeight: 700, fontSize: 20, marginTop: 10 }}>{this.state.project.name}</h2>
          {!!this.state.project.description && (
            <p style={{ opacity: 0.65 }}>
              {this.state.project.description}
              <br />
            </p>
          )}
          {this.state.project.creator ? (
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
            <div>{msgs}</div>
            <div>{events}</div>
          </Columns>
        ) : (
          <div>
            {msgs} {events}
          </div>
        )}

        {this.renderChanges()}
        <br />
      </div>
    );
  }
}
