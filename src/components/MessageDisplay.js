import React, { Component } from "react";
import { List } from "antd";
import User from "../classes/User";
import Messages from "../classes/Messages";
import $ from '../classes/Utils';

class MessageDisplay extends Component {
  state = {
    user: {},
    project: {},
    messageID: null,
    messenger: null,
    message:null,
    sender: {}
  };

  componentWillReceiveProps(props) {
    this.setState({
      user: props.user,
      project: props.project,
      messageID: props.messageID
    });
    if(props.message) {
      this.setState({message:props.message})
      User.get(props.message.sender).then(
        sender=>{this.setState({sender})}
      )
    } else {
      if (
        !this.state.messenger ||
        (props.project.messengerID !== this.state.messenger.uid)
      ) {
        this.setState({ messenger: null });
        Messages.get(props.project.messengerID).then(messenger => {
          if (messenger && props.messageID) {
            if (messenger.messages[props.messageID]) {
              User.get(messenger.messages[props.messageID].sender).then(
                sender => {
                  this.setState({ messenger, sender });
                }
              );
            }
          }
        });
      }
    }
  }

  render() {
    const targetMessage = this.state.message||(this.state.messenger?this.state.messenger.messages[this.state.messageID]:null)
    return targetMessage ? (
        <List.Item
          key={targetMessage.uid}
          style={Object.assign({ textAlign: "left" })}
        >
          <List.Item.Meta
            title={this.state.sender.name}
            description={$.date(targetMessage.timeSent).humanise()}
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
            {targetMessage.content.bodyText}
          </pre>
        </List.Item>
    ) : null;
  }
}

export default MessageDisplay;
