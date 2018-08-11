import React, { Component } from "react";

import Fire from "../classes/Fire";
import $ from "../classes/Utils";

import { Card, Icon, Avatar, Button, List } from "antd";
import Messages from "../classes/Messages";
import formatJSON from "format-json-pretty";
import Project from "../classes/Project";
import User from "../classes/User";
import UserGroupDisplay from "../components/UserGroupDisplay";
import MessageDisplay from "../components/MessageDisplay";
import TimelineItem from "../components/TimelineItem";
import FileDisplay from "../components/FileDisplay";
import Moment from "moment";

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
    messages: []
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({
      project: props.project,
      user: props.user
    });
    if (
      !this.state.mesenger ||
      this.state.messenger.uid !== props.project.messengerID
    ) {
      Messages.get(props.project.messengerID).then(messenger => {
        if (messenger) {
          this.setState({ messenger });
          messenger
            .getMessagesByDateOrder(10)
            .then(messages => this.setState({ messages }));
        }
      });
    }
  }

  shouldComponentUpdate(props, state) {
    if (!Project.equal(props.project, this.state.project)) return true;
    if (
      state.messages &&
      state.messages[0] &&
      state.messages[0].uid !== (this.state.messages[0] || {}).uid
    )
      return true;
    return false;
  }

  renderMessages(project, messages) {
    if (project && messages) {
      let newMessages = $.object(messages)
        .values()
        .splice(0, 5)
        .sort((a, b) => a.timeSent - b.timeSent)
        .filter(item => !(item.readBy || {})[this.state.user.uid]);
      return Object.keys(messages).length && newMessages.length ? (
        <div>
          <h2>
            <Icon type="message" />
            {" New Messages"}
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
            <div style={{ margin: "-24px 0" }}>
              <List itemLayout="vertical">
                {newMessages.map(item => (
                  <MessageDisplay
                    key={item.uid}
                    messageID={item.uid}
                    message={item}
                    project={this.state.project}
                    user={this.state.user}
                  />
                ))}
              </List>
            </div>
            <br />
          </Card>
        </div>
      ) : null;
    } else {
      return null;
    }
  }

  renderEvents(project) {
    if (project && project.events && project.events.length) {
      let events = project.events.filter(
        item =>
          new Moment(item.date).diff(new Moment(), "days") <= 5 &&
          new Moment(item.date).diff(new Moment(), "days") >= 0
      ).filter(item=>!item.markedAsCompleted);
      if (events.length) {
        return (
          <div>
            <h2>
              <Icon type="calendar" />
              {" Upcoming Events"}
            </h2>
            <br />
            {events
              .map(item => (
                <div key={item.uid}>
                  <TimelineItem
                  user={this.state.user}
                    onComplete={() => {
                      project.setEvent(
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
              ))
              .reverse()}
            <br />
          </div>
        );
      }
    }
  }

  async getContent(project) {
    //let messages = (await Messages.get(project.messengerID)).;
  }

  render() {
    return (
      <div
        style={{
          textAlign: "center"
        }}
      >
        {this.renderMessages(this.state.project, this.state.messages)}
        {this.renderEvents(this.state.project)}
        <h2>
          <Icon type="clock-circle-o" />
          {" Recent"}
        </h2>
        <br />
        {(this.state.project.history || [])
          .slice()
          .reverse()
          .slice(0,10)
          .map(item => (
            <div key={item.uid}>
              <Card
                actions={
                  item.type === "name" || item.type === "description"
                    ? null
                    : [
                        <span
                          onClick={() => {
                            this.props.passMessage({
                              type: "navigate",
                              content: (() => {
                                switch (item.type) {
                                  case "member":
                                    return 1;
                                  case "event":
                                    return 2;
                                  case "file":
                                    return 4;
                                  default:
                                    break;
                                }
                              })()
                            });
                          }}
                        >
                          <Icon type="export" />
                          {` ${(() => {
                            switch (item.type) {
                              case "event":
                                return "Timeline";
                              case "file":
                                return "Files";
                              case "member":
                                return "Members";
                              default:
                                break;
                            }
                          })()}`}
                        </span>
                      ]
                }
              >
                <div>
                  {
                    <span>
                      <UserGroupDisplay
                        style={{ display: "inline-block", marginBottom: -8 }}
                        people={{ members: [item.doneBy] }}
                      />
                      {`${item.action} ${
                        item.type === "name" || item.type === "description"
                          ? "the project"
                          : $.string(item.type.substring(0, 1)).isVowel()
                            ? "an"
                            : "a"
                      } ${item.type} ${$.date(item.doneAt).humanise()}`}
                    </span>
                  }
                </div>
                {(() => {
                  switch (item.type) {
                    case "event":
                      return (
                        <div>
                          <br />
                          {(this.state.project.events || []).find(
                            x => x.uid === item.content.uid
                          ) ? (
                            <TimelineItem
                              readOnly
                              user={this.state.user}
                              project={this.state.project}
                              event={this.state.project.events.find(
                                x => x.uid === item.content.uid
                              )}
                            />
                          ) : (
                            <span style={{ opacity: 0.65 }}>
                              {
                                "We can not display this event because it has been deleted."
                              }
                            </span>
                          )}
                        </div>
                      );
                      break;
                    case "file":
                      let file = (this.state.project.files || []).find(
                        x => x.uid === item.content.uid
                      );
                      if (!file)
                        file = (this.state.project.files || [])
                          .filter(x => x.uploadType === "cloud")
                          .find(x => x.source.id === item.content.uid);
                      return (
                        <div>
                          <br />
                          {file ? (
                            <FileDisplay
                              readOnly
                              project={this.state.project}
                              file={file}
                            />
                          ) : (
                            <span style={{ opacity: 0.65 }}>
                              {
                                "We can not display this file because it has been deleted."
                              }
                            </span>
                          )}
                        </div>
                      );
                      break;
                    case "member":
                      break;
                    default:
                      break;
                  }
                })()}
              </Card>
              <br />
            </div>
          ))}
        <Card>
          <div style={{ opacity: 0.65 }}>
            Nothing else to show.
          </div>
        </Card>
        <br />
      </div>
    );
  }
}
