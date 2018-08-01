import React, { Component } from "react";
import { Input, Button, Icon, List, Affix } from "antd";
import Messages, { Message } from "../classes/Messages";
import update from "immutability-helper";
import { IDGen } from "../classes/Utils";
import UserGroupDisplay from "../components/UserGroupDisplay";
import "./Messages.css";
import User from "../classes/User";

class MESSAGES extends Component {
  state = {
    project: {},
    user: {},
    inputValue: "",
    messenger: null,
    messages: {},
    messageStatus: {},
    orderedMessages: [],
    cachedUsers: {}
  };

  componentWillReceiveProps(props) {
    this.setState({ user: props.user });
    if (!props.project.projectID) return;
    if (
      props.project.projectID === this.state.project.projectID &&
      props.project.lastUpdatedTimestamp ===
        this.state.project.lastUpdatedTimestamp
    )
      return;
    this.setState({ project: props.project });
    if (!props.project.messengerID) {
      props.project.setMessenger(props.project.projectID);
    }
    if (this.state.messenger)
      this.state.messenger.off("message", this.handleReceive.bind(this));
    this.setState(
      { messenger: null, messages: {}, orderedMessages: [] },
      () => {
        Messages.get(props.project.messengerID || props.project.projectID).then(
          messenger => {
            if (messenger) {
              messenger.startListening();
              messenger.on("message", this.handleReceive.bind(this));
              this.setState({ messenger, messages: messenger.messages }, () => {
                this.cacheUsers();
                this.cacheItems();
              });
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
      }
    );
  }

  scrollBottom() {
    this.props.passMessage("scroll-bottom");
  }

  handleReceive(msg) {
    const needUpdate = !this.state.messages[msg.uid];
    this.setState(
      {
        messages: update(this.state.messages, { $merge: { [msg.uid]: msg } })
      },
      () => {
        this.cacheUsers();
        if (needUpdate) {
          this.setState(
            {
              orderedMessages: update(this.state.orderedMessages, {
                $push: [msg]
              })
            },
            () => {
              this.scrollBottom();
            }
          );
        }
      }
    );
  }

  handleSend() {
    if (this.state.messenger) {
      let msg = new Message({
        content: { bodyText: this.state.inputValue.value },
        sender: this.state.user.uid
      });
      this.state.inputValue.value = "";
      console.log(msg);
      this.setState(
        {
          messages: update(this.state.messages, { $merge: { [msg.uid]: msg } }),
          messageStatus: update(this.state.messageStatus, {
            $merge: { [msg.uid]: "sending" }
          }),
          orderedMessages: update(this.state.orderedMessages, { $push: [msg] })
        },
        () => {
          this.scrollBottom();
        }
      );
      this.state.messenger.addMessage(msg).then(() => {
        this.setState({
          messageStatus: update(this.state.messageStatus, {
            $merge: { [msg.uid]: "sent" }
          })
        });
      });
    }
  }

  cacheItems() {
    let orderedMessages = Object.values(this.state.messages).sort(
      (a, b) =>
        a.timeSent === b.timeSent ? 0 : a.timeSent > b.timeSent ? 1 : -1
    );
    let index = 0;
    const loop = () => {
      this.setState(
        {
          orderedMessages: update(this.state.orderedMessages, {
            $push: [orderedMessages[index]]
          })
        },
        () => {
          this.scrollBottom();
          if (index < orderedMessages.length - 1) {
            index++;
            loop();
          }
        }
      );
    };
    if (orderedMessages.length) loop();
  }

  cacheUsers() {
    let cachedUsers = {};
    let messages = Object.values(this.state.messages);
    for (let i = 0; i < messages.length; i++) {
      if (cachedUsers[messages[i].sender]) continue;
      cachedUsers[messages[i].sender] = User.get(messages[i].sender);
      cachedUsers[messages[i].sender].then(user => {
        this.setState({
          cachedUsers: update(this.state.cachedUsers, {
            $merge: { [messages[i].sender]: user }
          })
        });
      });
    }
  }

  render() {
    return (
      <div style={{ position: "relative" }}>
        <div className="messages">
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
                {item.content.bodyText}{" "}
                {this.state.messageStatus[item.uid] === "sending" && (
                  <Icon type="loading" />
                )}{" "}
                {this.state.messageStatus[item.uid] === "sent" && (
                  <Icon type="check" />
                )}
              </List.Item>
            ))}
          </List>
        </div>
        <div
          style={{
            alignItems: "center",
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
          <Button shape="circle" icon="paper-clip" style={{ flex: "none" }} />
          <Input
            onChange={e => {
              this.setState({ inputValue: e.target });
            }}
            onPressEnter={(e => {
              this.handleSend();
            }).bind(this)}
            placeholder="Enter a message"
            style={{
              maxWidth: "100%",
              margin: 10
            }}
          />
          <Button
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
