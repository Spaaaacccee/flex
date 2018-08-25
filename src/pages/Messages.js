import React, { Component } from "react";
import { Input, Button, Icon, List, message, Popover, Mention } from "antd";
import Messages, { Message } from "../classes/Messages";
import update from "immutability-helper";
import $ from "../classes/Utils";
import "./Messages.css";
import User from "../classes/User";
import Project from "../classes/Project";
import MessageDisplay from "../components/MessageDisplay";
import { HSL } from "../classes/Role";
import { Scrollbars } from "react-custom-scrollbars";

class MESSAGES extends Component {
  /**
   * @type {{messenger:Messages}}
   * @memberof MESSAGES
   */

  state = {
    project: {},
    user: {},
    inputValue: Mention.toContentState(""),
    messenger: null,
    messageStatus: {},
    orderedMessages: [],
    cachedUsers: {},
    consoleStatus: "ready",
    consoleEditTarget: null,
    messageDisplayCount: 20,
    suggestions: []
  };
  clearMessageTriggerOffset = 200;
  loadMessageTriggerOffset = 10;
  initialMessagesCount = 20;
  batchLoadMessagesCount = 20;
  receivedMessages = {};

  componentWillReceiveProps(props) {
    this.setState({ user: props.user });
    if (!props.project) return;
    if (Project.equal(props.project, this.state.project)) return;
    this.setState({ project: props.project });
    if ((props.project || {}).projectID !== (this.state.project || {}).projectID) {
      if (this.state.messenger) {
        this.state.messenger.off();
        this.state.messenger.stopListening();
      }
      this.receivedMessages = {};
      this.setState({ messenger: null, orderedMessages: [] }, () => {
        Messages.get(props.project.messengerID || props.project.projectID).then(messenger => {
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
            Messages.forceUpdate(props.project.messengerID || props.project.projectID, new Messages()).then(() => {
              this.componentWillReceiveProps(this.props);
            });
          }
        });
      });
    }
  }

  lastScrollHeight = 0;
  scrollHeightWatcher = () => {
    cancelAnimationFrame(this.scrollHeightWatcher);
    if (!this.scrollElement) return;
    if (this.loadingMore && this.scrollElement.getScrollHeight() !== this.lastScrollHeight) {
      this.loadingMore = false;
      //this.scrollElement.style.overflow = "";
      this.scrollElement.scrollTop(this.scrollElement.getScrollHeight() - this.dist);
    } else {
      this.lastScrollHeight = this.scrollElement.getScrollHeight();
    }
    requestAnimationFrame(this.scrollHeightWatcher);
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
    requestAnimationFrame(this.scrollHeightWatcher);
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.scrollHeightWatcher);
    if (this.state.messenger) {
      this.state.messenger.off();
      this.state.messenger.stopListening();
    }
  }
  async scrollBottom() {
    if (!this.scrollElement) return;
    await this.scrollToSmooth(300, this.scrollElement.getScrollHeight());
    this.trySetRead();
  }

  loadingMore = false;
  dist = 0;
  loadMore() {
    if (!this.scrollElement) return;
    if (this.state.orderedMessages.length > this.state.messageDisplayCount) {
      this.loadingMore = true;
      //this.scrollElement.style.overflow = "hidden";
      this.dist = this.scrollElement.getScrollHeight() - this.scrollElement.getScrollTop();
      this.setState({
        messageDisplayCount: Math.min(
          this.state.orderedMessages.length,
          this.state.messageDisplayCount + this.batchLoadMessagesCount
        )
      });
    }
  }
  loadLess() {
    if (!this.scrollElement) return;
    if (this.state.messageDisplayCount > this.initialMessagesCount) {
      let dist = this.scrollElement.getScrollHeight() - this.scrollElement.getScrollTop();
      this.setState(
        {
          messageDisplayCount: this.initialMessagesCount
        },
        () => {
          this.scrollElement.scrollTop(this.scrollElement.getScrollHeight() - dist);
        }
      );
    }
  }
  trySetRead() {
    if (this.state.messenger) {
      if (
        Math.ceil(this.scrollElement.getScrollHeight()) >=
        this.scrollElement.getScrollHeight() - this.scrollElement.getClientHeight()
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
      const i = $.array(this.state.orderedMessages).indexOf(x => x.uid === msgID);
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
      const i = $.array(this.state.orderedMessages).indexOf(x => x.uid === msg.uid);
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
      this.setState(update(this.state, { orderedMessages: { $push: [msg] } }), () => {
        this.scrollBottom();
        this.cacheUsers();
      });
    }
  }
  handleDelete(msgID) {
    this.setState(
      Object.assign(
        update(this.state, {
          messageStatus: { [msgID]: { $set: "processing" } }
        }),
        this.state.consoleStatus === "editing" && msgID === this.state.consoleEditTarget.uid
          ? (() => {
              this.setInputValue("");
              return {
                consoleStatus: "ready",
                consoleEditTarget: null
              };
            })()
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
    let val = Mention.toString(this.state.inputValue).trim();
    if (!val) return;
    if (val.length > maxChars) {
      message.warn(`We limited your message to ${maxChars} characters. We have this restriction for other users as well.`);
      val = val.substring(0, maxChars);
    }
    let target = Object.assign({}, this.state.consoleEditTarget);
    this.setState(
      update(this.state, {
        consoleStatus: { $set: "ready" },
        messageStatus: { [target.uid]: { $set: "processing" } }
      }),
      () => {
        this.setInputValue("", () => {
          let res = update(target, {
            content: { bodyText: { $set: `${val}` } },
            edited: { $set: true }
          });
          this.state.messenger.setMessage(target.uid, res).then(() => {
            this.setState(
              update(this.state, {
                messageStatus: { [target.uid]: { $set: "sent" } }
              })
            );
            this.handleOnEdit(res);
          });
        });
      }
    );
  }
  handleSend() {
    this.inputElement.focus();
    const maxChars = 2000;
    let val = Mention.toString(this.state.inputValue).trim();
    if (!val) return;
    if (this.state.messenger) {
      if (val.length > maxChars) {
        message.warn(`We limited your message to ${maxChars} characters. We have this restriction for other users as well.`);
        val = val.substring(0, maxChars);
      }
      let msg = new Message({
        content: { bodyText: val },
        sender: this.state.user.uid,
        readBy: { [this.state.user.uid]: true }
      });
      this.receivedMessages[msg.uid] = msg;
      this.setState(
        update(this.state, {
          messageStatus: {
            $merge: { [msg.uid]: "processing" }
          },
          orderedMessages: { $push: [msg] }
        }),
        () => {
          this.sendMessage(msg);
        }
      );
      this.setInputValue("");
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
    if (!this.scrollElement) return;
    return new Promise((res, rej) => {
      if (this.isAnimating) res();
      //this.scrollElement.style.overflow = "hidden";
      this.isAnimating = true;
      let startY = this.scrollElement.getScrollTop();
      let Ydifference = endY - startY;
      let startTime = Date.now();
      let endTime = startTime + duration;
      let loop = () => {
        if (!this.scrollElement) return;
        let elapsedTime = Date.now() - startTime;
        this.scrollElement.scrollTop(startY + (elapsedTime / duration) * Ydifference);
        if (Date.now() <= endTime) {
          requestAnimationFrame(loop);
        } else {
          this.scrollElement.scrollTop(endY);
          //this.scrollElement.style.overflow = "";
          this.isAnimating = false;
          res();
        }
      };
      requestAnimationFrame(loop);
    });
  }

  settingInput = false;
  setInputValue(string, callback) {
    this.settingInput = true;
    const contentState = Mention.toContentState($.string(string).trimLeft());
    this.setState({ inputValue: contentState }, () => {
      if (callback) callback();
      this.settingInput = false;
    });
  }

  cacheItems() {
    let orderedMessages = $.object(this.receivedMessages)
      .values()
      .sort((a, b) => (a.timeSent === b.timeSent ? 0 : a.timeSent > b.timeSent ? 1 : -1));
    if (orderedMessages.length) {
      this.setState({ orderedMessages }, () => {
        this.scrollBottom();
      });
    }
  }
  cacheUsers() {
    let members = this.state.project.members || [];
    for (let member of members) {
      if (this.state.cachedUsers[member.uid]) continue;
      User.get(member.uid).then(user => {
        this.setState({
          cachedUsers: update(this.state.cachedUsers, {
            $merge: { [user.uid]: user }
          })
        });
      });
    }
  }
  inputElement;
  scrollElement;
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
        <Scrollbars
          onScrollStart={()=>{
            if(!this.isAnimating) {
              this.inputElement.onBlur();
              document.querySelector("div.DraftEditor-editorContainer > div").blur();
            }
          }}
          autoHide
          hideTracksWhenNotNeeded
          ref={e => (this.scrollElement = e)}
          className="messages"
          onScrollStop={(e => {
            if (!this.isAnimating) {
              if (this.scrollElement.getScrollTop() <= this.loadMessageTriggerOffset && !this.loadingMore) {
                this.loadMore();
              } else if (
                this.scrollElement.getScrollHeight() -
                  this.scrollElement.getClientHeight() -
                  this.scrollElement.getScrollTop() <=
                this.clearMessageTriggerOffset
              ) {
                this.loadLess();
              }
            }
            this.trySetRead();
          }).bind(this)}
        >
          <p style={{ opacity: 0.65, margin: 50 }}>
            {this.state.orderedMessages.length > this.state.messageDisplayCount ? (
              <span>
                <p>
                  <Icon type="loading" />
                </p>
                Stop scrolling here to load more messages
              </span>
            ) : (
              !!this.state.orderedMessages.length && (
                <span>
                  <p>
                    <Icon type="message" />
                  </p>
                  This marks the beginning of your conversation
                </span>
              )
            )}
          </p>
          {this.state.orderedMessages.length ? (
            <List itemLayout="vertical" style={{ userSelect: "text" }}>
              {this.state.orderedMessages
                .slice(Math.max(this.state.orderedMessages.length - 1 - this.state.messageDisplayCount, 0))
                .map((item, index) => (
                  <MessageDisplay
                    project={this.state.project}
                    user={this.state.user}
                    message={item}
                    status={this.state.messageStatus[item.uid]}
                    key={item.uid}
                    onQuotePressed={() => {
                      this.setInputValue(
                        `${(this.state.cachedUsers[item.sender] || {}).name || item.sender} on ${new Date(
                          item.timeSent
                        ).toLocaleString()} said:\n${item.content.bodyText}`,
                        () => {
                          this.scrollBottom().then(() => {
                            this.setState({
                              messageDisplayCount: this.initialMessagesCount
                            });
                          });
                        }
                      );
                      this.inputElement.focus();
                      document.execCommand("selectAll", false, null);
                    }}
                    onEditPressed={() => {
                      this.setState({
                        consoleStatus: "editing",
                        consoleEditTarget: item
                      });
                      this.setInputValue(item.content.bodyText);
                      this.inputElement.focus();
                      document.execCommand("selectAll", false, null);
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
        </Scrollbars>
        <div className="message-console" style={{ opacity: this.state.messenger ? 1 : 0 }}>
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
                  style={{ flex: "none", display: "none" }}
                  disabled={!this.state.messenger}
                />
              </Popover>
            )}
            <div
              style={{
                width: "100%",
                margin: 10,
                marginLeft: 0,
                textAlign: "left"
              }}
            >
              <div
                tabIndex="0"
                onKeyDown={e => {
                  if (e.keyCode === 27 && this.state.consoleStatus === "editing") {
                    this.setInputValue("");
                  } else if (e.keyCode === 13) {
                    if (!e.shiftKey) {
                      if (this.state.consoleStatus === "editing") {
                        this.handleEdit();
                      } else {
                        if (!document.querySelector(".ant-mention-dropdown:not(.slide-down-leave-active)")) {
                          this.handleSend();
                        }
                      }
                    }
                  }
                }}
              >
                <Mention
                  suggestions={this.state.suggestions}
                  placement="top"
                  multiLines
                  notFoundContent="No members or roles found. Press space to continue."
                  onSearchChange={query => {
                    let relevantRoles = $.array(this.state.project.roles || [])
                      .searchString(x => x.name, query)
                      .map(item => (
                        <Mention.Nav value={item.name + "#" + $.id().checkSum(item.uid)} data={item}>
                          <span style={{ color: HSL.toCSSColour(item.color) }}>
                            <Icon type="tags-o" /> {item.name}
                          </span>
                        </Mention.Nav>
                      ));
                    let relevantUsers = $.array($.object(this.state.cachedUsers).values())
                      .searchString(x => x.name, query)
                      .map(item => (
                        <Mention.Nav value={item.name + "#" + $.id().checkSum(item.uid)} data={item}>
                          <span>
                            <Icon type="user" /> {item.name}
                          </span>
                        </Mention.Nav>
                      ));
                    this.setState({
                      suggestions: [...relevantRoles, ...relevantUsers]
                    });
                  }}
                  onFocus={() => {
                    this.scrollBottom().then(() => {
                      this.setState({
                        messageDisplayCount: this.initialMessagesCount
                      });
                    });
                  }}
                  type="email"
                  ref={e => (this.inputElement = e)}
                  value={this.state.inputValue}
                  className="input"
                  onChange={e => {
                    if (!this.settingInput) {
                      this.setState({
                        inputValue: e
                      });
                    }
                  }}
                  placeholder={!this.state.messenger ? "Connecting" : "Enter a message"}
                  disabled={!this.state.messenger}
                />
              </div>
            </div>
            <Button
              icon={this.state.consoleStatus === "editing" ? "check" : null}
              style={{ flex: "none" }}
              onClick={(this.state.consoleStatus === "editing" ? this.handleEdit : this.handleSend).bind(this)}
              type="primary"
              disabled={!this.state.messenger || !Mention.toString(this.state.inputValue).trim()}
            >
              {this.state.consoleStatus === "editing" ? "" : "Send"}
            </Button>
            {this.state.consoleStatus === "editing" && (
              <Button
                icon="close"
                style={{ flex: "none", marginLeft: 10 }}
                onClick={() => {
                  this.setState({
                    consoleStatus: "ready"
                  });
                  this.setInputValue("");
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
