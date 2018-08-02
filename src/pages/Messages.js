import React, { Component } from "react";
import { Input, Button, Icon, List, Affix, message } from "antd";
import Messages, { Message } from "../classes/Messages";
import update from "immutability-helper";
import { IDGen } from "../classes/Utils";
import UserGroupDisplay from "../components/UserGroupDisplay";
import "./Messages.css";
import User from "../classes/User";
import allOff from "event-emitter/all-off";

class MESSAGES extends Component {
  state = {
    project: {},
    user: {},
    inputValue: "",
    messenger: null,
    messageStatus: {},
    orderedMessages: [],
    cachedUsers: {}
  };

  receivedMessages = {};

  componentWillReceiveProps(props) {
    this.setState({ user: props.user });
    if (!props.project.projectID) return;
    if (
      props.project.projectID === this.state.project.projectID &&
      props.project.lastUpdatedTimestamp ===
        this.state.project.lastUpdatedTimestamp &&
      props.project.messengerID === this.state.project.messengerID
    )
      return;
    this.setState({ project: props.project });
    if (!props.project.messengerID) {
      props.project.setMessenger(props.project.projectID);
    }
    if (this.state.messenger) allOff(this.state.messenger);
    this.receivedMessages = {};
    this.setState({ messenger: null, orderedMessages: [] }, () => {
      Messages.get(props.project.messengerID || props.project.projectID).then(
        messenger => {
          if (messenger) {
            this.receivedMessages = Object.assign({}, messenger.messages);
            messenger.on("message", x => {
              this.handleReceive(x);
            });
            messenger.startListening();
            this.setState({ cachedUsers: { [props.user.uid]: props.user } });
            this.cacheUsers();
            this.cacheItems();
            this.setState({ messenger });
          } else {
            Messages.forceUpdate(
              props.project.messengerID || props.project.projectID,
              new Messages()
            ).then(() => {
              this.forceUpdate();
            });
          }
        }
      );
    });
  }

  scrollBottom() {
    this.props.passMessage("scroll-bottom");
  }

  handleReceive(msg) {
    if (!this.receivedMessages[msg.uid]) {
      this.receivedMessages[msg.uid] = msg;
      this.setState(
        {
          orderedMessages: update(this.state.orderedMessages, { $push: [msg] })
        },
        () => {
          this.scrollBottom();
        }
      );
    }
  }

  handleSend() {
    const maxChars = 2000;
    let val = this.state.inputValue.trim();
    if (this.state.messenger) {
      if (val.length > maxChars) {
        message.warn(
          `We limited your message to ${maxChars} characters. We have this restriction for other users as well.`
        );
        val = val.substring(0, maxChars);
      }
      let msg = new Message({
        content: { bodyText: val },
        sender: this.state.user.uid
      });
      this.setState({ inputValue: "" });
      this.receivedMessages[msg.uid] = msg;
      this.setState(
        {
          messageStatus: update(this.state.messageStatus, {
            $merge: { [msg.uid]: "sending" }
          }),
          orderedMessages: update(this.state.orderedMessages, { $push: [msg] })
        },
        () => {
          this.scrollBottom();
          this.state.messenger.addMessage(msg).then(() => {
            this.setState({
              messageStatus: update(this.state.messageStatus, {
                $merge: { [msg.uid]: "sent" }
              })
            });
          });
        }
      );
    }
  }

  cacheItems() {
    let orderedMessages = Object.values(this.receivedMessages).sort(
      (a, b) =>
        a.timeSent === b.timeSent ? 0 : a.timeSent > b.timeSent ? 1 : -1
    );
    if (orderedMessages.length) {
      this.setState({ orderedMessages }, () => {
        this.scrollBottom();
      });
    }
  }

  cacheUsers() {
    let users = {};
    let msgs = Object.values(this.receivedMessages);
    for (let i = 0; i < msgs.length; i++) {
      if (users[msgs[i].sender]) continue;
      users[msgs[i].sender] = User.get(msgs[i].sender);
      users[msgs[i].sender].then(user => {
        this.setState({
          cachedUsers: update(this.state.cachedUsers, {
            $merge: { [msgs[i].sender]: user }
          })
        });
      });
    }
  }

  render() {
    return (
      <div style={{ position: "relative" }}>
        <div className="messages">
          {!!this.state.orderedMessages.length ? (
            <List itemLayout="vertical">
              {this.state.orderedMessages.map((item, index) => (
                <List.Item key={index} style={{ textAlign: "left" }}>
                  <List.Item.Meta
                    title={
                      (this.state.cachedUsers[item.sender] || {}).name ||
                      item.sender
                    }
                    description={new Date(item.timeSent).toLocaleString()}
                  />
                  <pre
                    style={{
                      whiteSpace: "pre-wrap",
                      display: "inline",
                      fontFamily: `"Chinese Quote", "-apple-system", "Segoe UI",
            "BlinkMacSystemFont", "Helvetica Neue", "Noto Sans", "Roboto", Arial,
            Helvetica, "PingFang SC", "Microsoft YaHei UI", sans-serif`
                    }}
                  >
                    {item.content.bodyText}
                  </pre>{" "}
                  {this.state.messageStatus[item.uid] === "sending" && (
                    <Icon type="loading" />
                  )}{" "}
                  {this.state.messageStatus[item.uid] === "sent" && (
                    <Icon type="check" />
                  )}
                </List.Item>
              ))}
            </List>
          ) : (
            <div style={{ opacity: 0.65, margin: 50, marginTop: "10vh" }}>
              <Icon type="message" />
              <br />
              <br />
              {this.state.messenger ? (
                <div>
                  You and your team's messages will appear here.<br />
                  Why don't you start a conversation?
                </div>
              ) : (
                <div>
                We're getting Messages ready.<br />
                It won't take too long.
              </div>
              )}
              <br />
              <br />
            </div>
          )}
        </div>
        <div
          style={{
            alignItems: "baseline",
            justifyContent: "center",
            background: "white",
            zIndex: 1,
            display: "flex",
            position: "fixed",
            width: "calc(100% - 20px)",
            maxWidth: 600,
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 0,
            margin: "auto"
          }}
        >
          <Button
            shape="circle"
            icon="paper-clip"
            style={{ flex: "none" }}
            disabled={!this.state.messenger}
          />
          <Input.TextArea
            value={this.state.inputValue}
            autosize={{ minRows: 1, maxRows: 5 }}
            className="input"
            onChange={e => {
              this.setState({ inputValue: e.target.value.trimStart() });
            }}
            onPressEnter={(e => {
              console.log(e);
              if (e.shiftKey) {
                this.handleSend();
              }
            }).bind(this)}
            placeholder={
              !this.state.messenger
                ? "Connecting to messages"
                : "Enter a message"
            }
            style={{
              maxWidth: "100%",
              margin: 10
            }}
            disabled={!this.state.messenger}
          />
          <Button
            style={{ flex: "none" }}
            onClick={() => {
              this.handleSend();
            }}
            type="primary"
            disabled={!this.state.messenger}
          >
            Send
          </Button>
        </div>
      </div>
    );
  }
}

export default MESSAGES;
