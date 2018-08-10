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
import FileDisplay from '../components/FileDisplay';
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
    messenger: null
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({
      project: props.project,
      user: props.user
    });
    Messages.get(props.project.messengerID).then(messenger => {
      if (messenger) {
        this.setState({ messenger });
        messenger
          .getMessagesByDateOrder(10)
          .then(messages => this.setState({ messages }));
      }
    });
  }

  shouldComponentUpdate(props, state) {
    if (!Project.equal(props.project, this.state.project)) return true;
    if (state.messages !== this.state.messages) return true;
    if (state.messenger !== this.state.messenger) return true;
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
        <Card
          title="Unread messages"
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
          <br/>
        </Card>
      ) : null;
    } else {
      return null
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
        {(this.state.project.history || [])
          .slice()
          .reverse()
          .map(item => (
            <div key={item.uid}>
              <Card
                actions={[
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
                    {` Show in ${(() => {
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
                ]}
              >
                <p>
                  {
                    <span>
                      <UserGroupDisplay
                        style={{ display: "inline-block" }}
                        people={{ members: [item.doneBy] }}
                      />
                      {`${item.action} ${
                        $.string(item.type.substring(0, 1)).isVowel()
                          ? "an"
                          : "a"
                      } ${item.type} ${$.date(item.doneAt).humanise()}`}
                    </span>
                  }
                </p>
                {(() => {
                  switch (item.type) {
                    case "event":
                      return (this.state.project.events || []).filter(
                        x => x.uid === item.content.uid
                      )[0] ? (
                        <TimelineItem
                          readOnly
                          project={this.state.project}
                          event={
                            this.state.project.events.filter(
                              x => x.uid === item.content.uid
                            )[0]
                          }
                        />
                      ) : (
                        <span style={{opacity:0.65}}>{"We can not display this event because it has been deleted."}</span>
                      );
                      break;
                    case "file":
                    
                    return (this.state.project.files || []).filter(
                      x => x.uid === item.content.uid
                    )[0] ? (
                      <FileDisplay
                        readOnly
                        project={this.state.project}
                        file={
                          this.state.project.files.filter(
                            x => x.uid === item.content.uid
                          )[0]
                        }
                      />
                    ) : (
                      <span style={{opacity:0.65}}>{"We can not display this file because it has been deleted."}</span>
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
      </div>
    );
  }
}
