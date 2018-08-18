import React, { Component } from "react";
import {
  Input,
  Button,
  Icon,
  List,
  Affix,
  message,
  Popover,
  Popconfirm,
  Avatar
} from "antd";
import Messages, { Message } from "../classes/Messages";
import update from "immutability-helper";
import $ from "../classes/Utils";
import UserGroupDisplay from "../components/UserGroupDisplay";
import "./Messages.css";
import User from "../classes/User";
import Project from "../classes/Project";
import Moment from "moment";
import { HSL } from "../classes/Role";
import MemberDisplay from "../components/MemberDisplay";
import FileDisplay from "../components/FileDisplay";
import { HistoryItem } from "../classes/History";
import HistoryDisplay from "../components/HistoryDisplay";
import MessageDisplay from "../components/MessageDisplay";
class MESSAGES extends Component {
  /**
   * @type {{messenger:Messages}}
   * @memberof MESSAGES
   */

  state = {
    project: {},
    user: {},
    inputValue: "",
    messenger: null,
    messageStatus: {},
    orderedMessages: [],
    cachedUsers: {},
    consoleStatus: "ready",
    consoleEditTarget: null,
    messageDisplayCount: 20
  };
  clearMessageTriggerOffset = 200;
  loadMessageTriggerOffset = 10;
  initialMessagesCount = 20;
  batchLoadMessagesCount = 20;
  receivedMessages = {};
  componentWillReceiveProps(props) {
    this.setState({ user: props.user });
    if (Project.equal(props.project, this.state.project)) return;
    this.setState({ project: props.project });
    if (this.state.messenger) {
      this.state.messenger.off();
      this.state.messenger.stopListening();
    }
    this.receivedMessages = {};
    this.setState({ messenger: null, orderedMessages: [] }, () => {
      Messages.get(props.project.messengerID || props.project.projectID).then(
        messenger => {
          if (messenger) {
            this.setState({ messenger });
            this.receivedMessages = Object.assign({}, messenger.messages);
            messenger.on("message", x => this.handleOnReceive(x));
            messenger.on("edit", x => this.handleOnEdit(x));
            messenger.on("delete", x => this.handleOnDelete(x.uid));
            messenger.startListening();
            this.setState({ cachedUsers: { [props.user.uid]: props.user } });
            this.cacheUsers();
            this.cacheItems();
            this.props.onLoad(this);
            this.scrollBottom();
          } else {
            Messages.forceUpdate(
              props.project.messengerID || props.project.projectID,
              new Messages()
            ).then(() => {
              this.componentWillReceiveProps(this.props);
            });
          }
        }
      );
    });
  }

  lastScrollHeight = 0;
  scrollHeightWatcher = () => {
    cancelAnimationFrame(this.scrollHeightWatcher);
    if (
      this.loadingMore &&
      this.scrollElement.scrollHeight !== this.lastScrollHeight
    ) {
      this.loadingMore = false;
      this.scrollElement.style.overflow = "";
      this.scrollElement.scrollTop =
        this.scrollElement.scrollHeight - this.dist;
    } else {
      this.lastScrollHeight = this.scrollElement.scrollHeight;
    }
    requestAnimationFrame(this.scrollHeightWatcher);
  };

  componentDidMount() {
    requestAnimationFrame(this.scrollHeightWatcher);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.scrollHeightWatcher);
    if (this.state.messenger) {
      this.state.messenger.stopListening();
    }
  }
  async scrollBottom() {
    await this.scrollToSmooth(300, this.scrollElement.scrollHeight);
    this.trySetRead();
  }
  loadingMore = false;
  dist = 0;
  loadMore() {
    if (this.state.orderedMessages.length > this.state.messageDisplayCount) {
      this.loadingMore = true;
      this.scrollElement.style.overflow = "hidden";
      this.dist =
        this.scrollElement.scrollHeight - this.scrollElement.scrollTop;
      this.setState({
        messageDisplayCount: Math.min(
          this.state.orderedMessages.length,
          this.state.messageDisplayCount + this.batchLoadMessagesCount
        )
      });
    }
  }
  loadLess() {
    if (this.state.messageDisplayCount > this.initialMessagesCount) {
      let dist = this.scrollElement.scrollHeight - this.scrollElement.scrollTop;
      this.setState(
        {
          messageDisplayCount: this.initialMessagesCount
        },
        () => {
          this.scrollElement.scrollTop = this.scrollElement.scrollHeight - dist;
        }
      );
    }
  }
  trySetRead() {
    if (this.state.messenger) {
      if (
        Math.ceil(this.scrollElement.scrollTop) >=
        this.scrollElement.scrollHeight - this.scrollElement.offsetHeight
      ) {
        $.object(this.receivedMessages)
          .values()
          .forEach(item => this.state.messenger.setRead(item.uid, true));
      }
    }
  }
  handleOnDelete(msgID) {
    if (this.receivedMessages[msgID]) {
      delete this.receivedMessages[msgID];
      const i = $.array(this.state.orderedMessages).indexOf(
        x => x.uid === msgID
      );
      if (i !== -1) {
        this.setState(
          update(this.state, {
            orderedMessages: { $splice: [[i, 1]] }
          })
        );
      }
    }
  }
  handleOnEdit(msg) {
    if (this.receivedMessages[msg.uid]) {
      this.receivedMessages[msg.uid] = msg;
      const i = $.array(this.state.orderedMessages).indexOf(
        x => x.uid === msg.uid
      );
      if (i !== -1) {
        this.setState(
          update(this.state, {
            orderedMessages: { $splice: [[i, 1, msg]] }
          })
        );
      }
    }
  }
  handleOnReceive(msg) {
    if (!this.receivedMessages[msg.uid]) {
      this.receivedMessages[msg.uid] = msg;
      this.setState(
        update(this.state, { orderedMessages: { $push: [msg] } }),
        () => {
          this.scrollBottom();
          this.cacheUsers();
        }
      );
    }
  }
  handleDelete(msgID) {
    this.setState(
      Object.assign(
        update(this.state, {
          messageStatus: { [msgID]: { $set: "processing" } }
        }),
        this.state.consoleStatus === "editing" &&
        msgID === this.state.consoleEditTarget.uid
          ? { inputValue: "", consoleStatus: "ready", consoleEditTarget: null }
          : {}
      ),
      () => {
        this.state.messenger.deleteMessage(msgID).then(() => {
          this.handleOnDelete(msgID);
        });
      }
    );
  }
  handleEdit() {
    this.inputElement.focus();
    const maxChars = 2000;
    let val = this.state.inputValue.trim();
    if (!val) return;
    if (val.length > maxChars) {
      message.warn(
        `We limited your message to ${maxChars} characters. We have this restriction for other users as well.`
      );
      val = val.substring(0, maxChars);
    }
    let target = Object.assign({}, this.state.consoleEditTarget);
    this.setState(
      update(this.state, {
        inputValue: { $set: "" },
        consoleStatus: { $set: "ready" },
        messageStatus: { [target.uid]: { $set: "processing" } }
      })
    );
    let res = update(target, {
      content: { bodyText: { $set: val } }
    });
    this.state.messenger.setMessage(target.uid, res).then(() => {
      this.setState(
        update(this.state, {
          messageStatus: { [target.uid]: { $set: "sent" } }
        })
      );
      this.handleOnEdit(res);
    });
  }
  handleSend() {
    this.inputElement.focus();
    const maxChars = 2000;
    let val = this.state.inputValue.trim();
    if (!val) return;
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
      this.receivedMessages[msg.uid] = msg;
      this.setState(
        update(this.state, {
          messageStatus: {
            $merge: { [msg.uid]: "processing" }
          },
          orderedMessages: { $push: [msg] },
          inputValue: { $set: "" }
        }),
        () => {
          this.sendMessage(msg);
        }
      );
    }
  }
  handleSendRaw(msg) {
    this.receivedMessages[msg.uid] = msg;
    if (this.state.messenger) {
      this.state.messenger;
      this.setState(
        update(this.state, {
          messageStatus: { $merge: { [msg.uid]: "processing" } },
          orderedMessages: { $push: [msg] }
        }),
        () => {
          this.sendMessage(msg);
        }
      );
    }
  }
  sendMessage(msg) {
    if (this.state.messenger) {
      this.scrollBottom().then(() => {
        this.setState({ messageDisplayCount: this.initialMessagesCount });
      });
      this.state.messenger.addMessage(msg).then(() => {
        this.setState(
          update(this.state, {
            messageStatus: { $merge: { [msg.uid]: "sent" } }
          })
        );
      });
    }
  }
  isAnimating = false;
  scrollToSmooth(duration, endY) {
    return new Promise((res, rej) => {
      if (this.isAnimating) res();
      this.scrollElement.style.overflow = "hidden";
      this.isAnimating = true;
      let startY = this.scrollElement.scrollTop;
      let Ydifference = endY - startY;
      let startTime = Date.now();
      let endTime = startTime + duration;
      let loop = () => {
        let elapsedTime = Date.now() - startTime;
        this.scrollElement.scrollTop =
          startY + (elapsedTime / duration) * Ydifference;
        if (Date.now() <= endTime) {
          requestAnimationFrame(loop);
        } else {
          this.scrollElement.scrollTop = endY;
          this.scrollElement.style.overflow = "";
          this.isAnimating = false;
          res();
        }
      };
      requestAnimationFrame(loop);
    });
  }
  cacheItems() {
    let orderedMessages = $.object(this.receivedMessages)
      .values()
      .sort(
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
    let msgs = $.object(this.receivedMessages).values();
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
  inputElement;
  scrollElement = <div className="placeholder" />;
  render() {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >
        <div
          className="messages"
          ref={e => (this.scrollElement = e || this.scrollElement)}
          onScroll={(e => {
            if (!this.isAnimating) {
              if (
                this.scrollElement.scrollTop <= this.loadMessageTriggerOffset &&
                !this.loadingMore
              ) {
                this.loadMore();
              } else if (
                this.scrollElement.scrollHeight -
                  this.scrollElement.clientHeight -
                  this.scrollElement.scrollTop <=
                this.clearMessageTriggerOffset
              ) {
                this.loadLess();
              }
            }
            this.trySetRead();
          }).bind(this)}
        >
          <p style={{ opacity: 0.65, margin: 50 }}>
            {this.state.orderedMessages.length > this.state.messageDisplayCount
              ? "Keep scrolling to load more messages"
              : !!this.state.orderedMessages.length &&
                "This marks the beginning of your conversation"}
          </p>
          {this.state.orderedMessages.length ? (
            <List itemLayout="vertical" style={{ userSelect: "text" }}>
              {this.state.orderedMessages
                .slice(
                  Math.max(
                    this.state.orderedMessages.length -
                      1 -
                      this.state.messageDisplayCount,
                    0
                  )
                )
                .map((item, index) => (
                  <MessageDisplay
                    project={this.state.project}
                    user={this.state.user}
                    message={item}
                    status={this.state.messageStatus[item.uid]}
                    key={item.uid}
                    onQuotePressed={() => {
                      this.setState(
                        {
                          inputValue: `${(
                            this.state.cachedUsers[item.sender] || {}
                          ).name || item.sender} on ${new Date(
                            item.timeSent
                          ).toLocaleString()} said:\n${item.content.bodyText}\n`
                        },
                        () => {
                          this.scrollBottom().then(() => {
                            this.setState({
                              messageDisplayCount: this.initialMessagesCount
                            });
                          });
                        }
                      );
                      this.inputElement.focus();
                    }}
                    onEditPressed={() => {
                      this.setState({
                        consoleStatus: "editing",
                        consoleEditTarget: item,
                        inputValue: item.content.bodyText
                      });
                      this.inputElement.focus();
                    }}
                    onDeletePressed={() => {
                      this.handleDelete(item.uid);
                    }}
                  />
                ))}
            </List>
          ) : (
            <div style={{ opacity: 0.65, margin: 50, marginTop: "10vh" }}>
              <Icon type="message" />
              <br />
              <br />
              {this.state.messenger ? (
                <div>
                  You and your team's messages will appear here.
                  <br />
                  Why don't you start a conversation?
                </div>
              ) : (
                <div>
                  We're getting Messages ready.
                  <br />
                  It won't take too long.
                </div>
              )}
              <br />
              <br />
            </div>
          )}
        </div>
        <div
          className="message-console"
          style={{ opacity: this.state.messenger ? 1 : 0 }}
        >
          <div>
            {this.state.consoleStatus !== "editing" && (
              <Popover
                placement="topLeft"
                trigger="click"
                content={
                  <div>
                    <List size="small" style={{ margin: "-5px 0" }}>
                      {[
                        { icon: "file", name: "File", action: () => {} },
                        { icon: "calendar", name: "Event", action: () => {} },
                        { icon: "book", name: "History", action: () => {} },
                        { icon: "user", name: "Member", action: () => {} },
                        { icon: "tags-o", name: "Role", action: () => {} }
                      ].map((x, i) => (
                        <List.Item key={i}>
                          <a onClick={x.action}>
                            <Icon type={x.icon} />
                            {` ${x.name}`}
                          </a>
                        </List.Item>
                      ))}
                    </List>
                  </div>
                }
              >
                <Button
                  shape="circle"
                  icon="message"
                  style={{ flex: "none" }}
                  disabled={!this.state.messenger}
                />
              </Popover>
            )}
            <Input.TextArea
              onFocus={() => {
                this.scrollBottom().then(() => {
                  this.setState({
                    messageDisplayCount: this.initialMessagesCount
                  });
                });
              }}
              type="email"
              onKeyUp={e => {
                if (
                  e.keyCode === 27 &&
                  this.state.consoleStatus === "editing"
                ) {
                  this.setState({ consoleStatus: "ready", inputValue: "" });
                }
              }}
              ref={e => (this.inputElement = e)}
              value={this.state.inputValue}
              autosize={{ minRows: 1, maxRows: 5 }}
              className="input"
              onChange={e => {
                this.setState({
                  inputValue: $.string(e.target.value).trimLeft()
                });
              }}
              onPressEnter={(e => {
                console.log(e);
                e.preventDefault();
                if (e.shiftKey) {
                  this.setState({
                    inputValue: $.string(e.target.value + "\n").trimLeft()
                  });
                } else {
                  if (this.state.consoleStatus === "editing") {
                    this.handleEdit();
                  } else {
                    this.handleSend();
                  }
                }
              }).bind(this)}
              placeholder={
                !this.state.messenger ? "Connecting" : "Enter a message"
              }
              style={{
                maxWidth: "100%",
                margin: 10
              }}
              disabled={!this.state.messenger}
            />
            <Button
              icon={this.state.consoleStatus === "editing" ? "check" : null}
              style={{ flex: "none" }}
              onClick={(this.state.consoleStatus === "editing"
                ? this.handleEdit
                : this.handleSend
              ).bind(this)}
              type="primary"
              disabled={!this.state.messenger || !this.state.inputValue}
            >
              {this.state.consoleStatus === "editing" ? "" : "Send"}
            </Button>
            {this.state.consoleStatus === "editing" && (
              <Button
                icon="close"
                style={{ flex: "none", marginLeft: 10 }}
                onClick={() => {
                  this.setState({ consoleStatus: "ready", inputValue: "" });
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
}
export default MESSAGES;
