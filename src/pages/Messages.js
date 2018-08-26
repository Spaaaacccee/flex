import React, { Component } from "react";
import { Button, Icon, List, message, Popover, Mention } from "antd";
import Messages, { Message } from "../classes/Messages";
import update from "immutability-helper";
import $ from "../classes/Utils";
import "./Messages.css";
import User from "../classes/User";
import Project from "../classes/Project";
import MessageDisplay from "../components/MessageDisplay";
import { HSL } from "../classes/Role";
import { Scrollbars } from "react-custom-scrollbars";

/**
 * Page for discussion.
 * @class MESSAGES
 * @extends Component
 */
class MESSAGES extends Component {
  /**
   * @type {{messenger:Messages}}
   * @memberof MESSAGES
   */

  state = {
    project: {}, // The source project.
    user: {}, // The current user.
    inputValue: Mention.toContentState(""), // The content of the message input.
    messenger: null, // The messenger to send and receive messages with.
    messageStatus: {}, // A dictionary that defines whether each message is sent or processing etc.
    orderedMessages: [], // A list of messages to render.
    cachedUsers: {}, // A dictionary of user information.
    consoleStatus: "ready", // Whether the text input is in send mode or edit mode.
    consoleEditTarget: null, // The message that is currently being edited.
    messageDisplayCount: 20, // The number of messages to initially display.
    suggestions: [] // The list of suggested people.
  };
  clearMessageTriggerOffset = 200; // The vertical distance to the bottom in pixels before the messages to display should return to the initial count.
  loadMessageTriggerOffset = 10; // The vertical distance to top in pixels before more messages should load.
  initialMessagesCount = 20; // The number of messages to initially load.
  batchLoadMessagesCount = 20; // The number of messages to load every time the user asks to load more.
  receivedMessages = {}; // A list of all received messages.

  componentWillReceiveProps(props) {
    this.setState({ user: props.user });
    if (!props.project) return;
    // Update project information.
    if (Project.equal(props.project, this.state.project)) return;
    this.setState({ project: props.project });

    // If the project changed then reattach messenger.
    if ((props.project || {}).projectID !== (this.state.project || {}).projectID) {
      // Remove the current messenger.
      if (this.state.messenger) {
        this.state.messenger.off();
        this.state.messenger.stopListening();
      }
      // Clear all messages.
      this.receivedMessages = {};
      this.setState({ messenger: null, orderedMessages: [] }, () => {
        // Get a new messenger.
        Messages.get(props.project.messengerID || props.project.projectID).then(messenger => {
          if (messenger) {
            this.setState({ messenger });

            // Populate the initial messages.
            this.receivedMessages = Object.assign({}, messenger.messages);
            // Attach listeners and start listening.
            messenger.on("message", x => this.handleOnReceive(x));
            messenger.on("edit", x => this.handleOnEdit(x));
            messenger.on("delete", x => this.handleOnDelete(x.uid));
            messenger.startListening();

            // Cache all users.
            this.setState({ cachedUsers: { [props.user.uid]: props.user } });
            this.cacheUsers();
            this.cacheItems();

            // Inform the parent component that this component has loaded.
            this.props.onLoad(this);
            this.scrollBottom();
          } else {
            // If no messenger is associated with a project then create one and try again.
            Messages.forceUpdate(props.project.messengerID || props.project.projectID, new Messages()).then(() => {
              this.componentWillReceiveProps(this.props);
            });
          }
        });
      });
    }
  }

  /**
   * The last height of the messages element. Used for keeping the messages element fixed to bottom.
   * @memberof MESSAGES
   */
  lastScrollHeight = 0;

  /**
   * Ensures that the messages element always sticks to the bottom.
   * @memberof MESSAGES
   */
  scrollHeightWatcher = () => {
    cancelAnimationFrame(this.scrollHeightWatcher);
    if (!this.scrollElement) return;

    // If more messages is loading, then wait until the height changes.
    if (this.loadingMore && this.scrollElement.getScrollHeight() !== this.lastScrollHeight) {
      this.loadingMore = false;
      // Apply the original distance to the bottom.
      this.scrollElement.scrollTop(this.scrollElement.getScrollHeight() - this.distanceToBottom);
    } else {
      // Keep a record of how far the element has scrolled to the bottom.
      this.lastScrollHeight = this.scrollElement.getScrollHeight();
    }
    requestAnimationFrame(this.scrollHeightWatcher);
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
    requestAnimationFrame(this.scrollHeightWatcher);
  }

  componentWillUnmount() {
    // Stop watching for scroll height changes.
    cancelAnimationFrame(this.scrollHeightWatcher);
    if (this.state.messenger) {
      // Stop listening to messages.
      this.state.messenger.stopListening();
      this.state.messenger.off();
    }
  }

  /**
   * Scroll to the bottom of the chat.
   * @return
   * @memberof MESSAGES
   */
  async scrollBottom() {
    if (!this.scrollElement) return;
    await this.scrollToSmooth(300, this.scrollElement.getScrollHeight());
    // Try to set all of the messages as read once the scroll ends.
    this.trySetRead();
  }

  /**
   * Whether this component is currently loading more messages.
   * @memberof MESSAGES
   */
  loadingMore = false;

  /**
   * The distance, in pixels, to the bottom of the scroll element.
   * @memberof MESSAGES
   */
  distanceToBottom = 0;

  loadMore() {
    if (!this.scrollElement) return;
    // If there are more messages to load, load them
    if (this.state.orderedMessages.length > this.state.messageDisplayCount) {
      // Start loading.
      this.loadingMore = true;
      // Record the current distance to bottom. This will be restored later.
      this.distanceToBottom = this.scrollElement.getScrollHeight() - this.scrollElement.getScrollTop();
      // Load the new messages.
      this.setState({
        messageDisplayCount: Math.min(
          this.state.orderedMessages.length,
          this.state.messageDisplayCount + this.batchLoadMessagesCount
        )
      });
    }
  }

  /**
   * Remove unecessary messages to improve performance.
   * @return
   * @memberof MESSAGES
   */
  loadLess() {
    if (!this.scrollElement) return;
    // If there are too many messages displayed, remove some of them.
    if (this.state.messageDisplayCount > this.initialMessagesCount) {
      // Record the current distance to bottom. This will be restored later.
      let dist = this.scrollElement.getScrollHeight() - this.scrollElement.getScrollTop();
      // Unload the messages.
      this.setState({ messageDisplayCount: this.initialMessagesCount }, () => {
        // Restore the original scroll position.
        this.scrollElement.scrollTop(this.scrollElement.getScrollHeight() - dist);
      });
    }
  }

  /**
   * Try to set all of the messages as read.
   * @return {void}
   * @memberof MESSAGES
   */
  trySetRead() {
    if (this.state.messenger) {
      // Only set messages to read if the user has scrolled to the bottom.
      if (
        Math.ceil(this.scrollElement.getScrollHeight()) >=
        this.scrollElement.getScrollHeight() - this.scrollElement.getClientHeight()
      ) {
        // If so, for every message, set it to read.
        $.object(this.receivedMessages)
          .values()
          .forEach(item => this.state.messenger.setRead(item.uid, true));
      }
    }
  }

  /**
   * Handles when a message is deleted.
   * @param  {String} msgID
   * @return {void}
   * @memberof MESSAGES
   */
  handleOnDelete(msgID) {
    if (this.receivedMessages[msgID]) {
      // Delete the message.
      delete this.receivedMessages[msgID];
      const i = $.array(this.state.orderedMessages).indexOf(x => x.uid === msgID);
      if (i !== -1) {
        // Reflect this change in the list of displayed messages.
        this.setState(
          update(this.state, {
            orderedMessages: { $splice: [[i, 1]] }
          })
        );
      }
    }
  }

  /**
   * Handles when a message is edited.
   * @param  {String} msg
   * @return {void}
   * @memberof MESSAGES
   */
  handleOnEdit(msg) {
    if (this.receivedMessages[msg.uid]) {
      // Update the message.
      this.receivedMessages[msg.uid] = msg;
      const i = $.array(this.state.orderedMessages).indexOf(x => x.uid === msg.uid);
      if (i !== -1) {
        // Reflect this change in the list of displayed messages.
        this.setState(
          update(this.state, {
            orderedMessages: { $splice: [[i, 1, msg]] }
          })
        );
      }
    }
  }

  /**
   * Handles when a new message is received.
   * @param  {String} msg
   * @return {void}
   * @memberof MESSAGES
   */
  handleOnReceive(msg) {
    if (!this.receivedMessages[msg.uid]) {
      // Add the message.
      this.receivedMessages[msg.uid] = msg;
      // Scroll to bottom, and update the list of displayed messages to reflect this change.
      this.setState(update(this.state, { orderedMessages: { $push: [msg] } }), () => {
        this.scrollBottom();
        this.cacheUsers();
      });
    }
  }

  /**
   * Delete a message.
   * @param  {String} msg
   * @return {void}
   * @memberof MESSAGES
   */
  handleDelete(msgID) {
    // Show the message as loading.
    this.setState(
      {
        ...update(this.state, {
          messageStatus: { [msgID]: { $set: "processing" } }
        }),
        ...(this.state.consoleStatus === "editing" && msgID === this.state.consoleEditTarget.uid
          ? (() => {
              // If the console is in edit mode, clear it.
              this.setInputValue("");
              return {
                consoleStatus: "ready",
                consoleEditTarget: null
              };
            })()
          : {})
      },
      () => {
        // Delete the message.
        this.state.messenger.deleteMessage(msgID).then(() => {
          this.handleOnDelete(msgID);
        });
      }
    );
  }

  /**
   * Edit a message
   * @return
   * @memberof MESSAGES
   */
  handleEdit() {
    this.inputElement.focus();
    const maxChars = 2000;
    let val = Mention.toString(this.state.inputValue).trim();
    if (!val) return;
    // Trim the message if it's too long.
    if (val.length > maxChars) {
      message.warn(`We limited your message to ${maxChars} characters. We have this restriction for other users as well.`);
      val = val.substring(0, maxChars);
    }
    // Make a copy of the current edit target.
    let target = {
      ...this.state.consoleEditTarget
    };
    this.setState(
      // Return to normal console state, and set the new message to processing.
      update(this.state, {
        consoleStatus: { $set: "ready" },
        messageStatus: { [target.uid]: { $set: "processing" } }
      }),
      () => {
        // Clear the console.
        this.setInputValue("", () => {
          let res = update(target, {
            content: { bodyText: { $set: `${val}` } },
            edited: { $set: true }
          });
          // Register the edit.
          this.state.messenger.setMessage(target.uid, res).then(() => {
            this.setState(
              update(this.state, {
                messageStatus: { [target.uid]: { $set: "sent" } }
              })
            );

            // Notify the UI of this change.
            this.handleOnEdit(res);
          });
        });
      }
    );
  }

  /**
   * Send a message
   * @return
   * @memberof MESSAGES
   */
  handleSend() {
    this.inputElement.focus();
    const maxChars = 2000;
    let val = Mention.toString(this.state.inputValue).trim();
    if (!val) return;
    if (this.state.messenger) {
      // Trim the message if it's too long.
      if (val.length > maxChars) {
        message.warn(`We limited your message to ${maxChars} characters. We have this restriction for other users as well.`);
        val = val.substring(0, maxChars);
      }

      // Prepare the new message.
      let msg = new Message({
        content: { bodyText: val },
        sender: this.state.user.uid,
        readBy: { [this.state.user.uid]: true }
      });

      // Add the message locally.
      this.receivedMessages[msg.uid] = msg;

      // Set the UI to show this message as processing.
      this.setState(
        update(this.state, {
          messageStatus: {
            $merge: { [msg.uid]: "processing" }
          },
          orderedMessages: { $push: [msg] }
        }),
        () => {
          // Send the message.
          this.sendMessage(msg);
        }
      );
      // Clear the console.
      this.setInputValue("");
    }
  }

  /**
   * Directly send a message object.
   * @param  {Message} msg
   * @return {void}
   * @memberof MESSAGES
   */
  handleSendRaw(msg) {
    // Add the message locally.
    this.receivedMessages[msg.uid] = msg;
    if (this.state.messenger) {
      // Set the UI to display the new message as processing.
      this.setState(
        update(this.state, {
          messageStatus: { $merge: { [msg.uid]: "processing" } },
          orderedMessages: { $push: [msg] }
        }),
        () => {
          // Send the message.
          this.sendMessage(msg);
        }
      );
    }
  }

  /**
   * Send a message.
   * @param  {any} msg
   * @return {void}
   * @memberof MESSAGES
   */
  sendMessage(msg) {
    if (this.state.messenger) {
      // Scroll to bottom, and remove uncessary messages that are rendered.
      this.scrollBottom().then(() => {
        this.setState({ messageDisplayCount: this.initialMessagesCount });
      });
      // Add the message to the messenger.
      this.state.messenger.addMessage(msg).then(() => {
        this.setState(
          // Update the UI so that the message appears as sent.
          update(this.state, {
            messageStatus: { $merge: { [msg.uid]: "sent" } }
          })
        );
      });
    }
  }

  /**
   * Whether a scroll animation is currently ongoing.
   * @memberof MESSAGES
   */
  isAnimating = false;
  scrollToSmooth(duration, endY) {
    if (!this.scrollElement) return;
    return new Promise(res => {
      // If another scroll animation is currently ongoing, then don't apply this scroll too.
      if (this.isAnimating) res();
      this.isAnimating = true;
      // Prepare initial variables.
      let startY = this.scrollElement.getScrollTop();
      let Ydifference = endY - startY;
      let startTime = Date.now();
      let endTime = startTime + duration;
      let loop = () => {
        if (!this.scrollElement) return;
        // For every frame, move towards the target Y value a fraction of the time that has elapsed.
        let elapsedTime = Date.now() - startTime;
        this.scrollElement.scrollTop(startY + (elapsedTime / duration) * Ydifference);
        if (Date.now() <= endTime) {
          requestAnimationFrame(loop);
        } else {
          // If the duration has past, set the scroll position to the destination value.
          this.scrollElement.scrollTop(endY);
          this.isAnimating = false;
          // Resolve the promise.
          res();
        }
      };
      // Start the loop.
      requestAnimationFrame(loop);
    });
  }

  /**
   * Whether the input value is currently being set.
   * @memberof MESSAGES
   */
  settingInput = false;

  /**
   * Set the input value manually.
   * This is required as the Ant Design's Mention API has some severe flaws that does not allow the value to be set through a controlled component.
   * @param  {String} string
   * @param  {()=>{}} callback
   * @return {void}
   * @memberof MESSAGES
   */
  setInputValue(string, callback) {
    this.settingInput = true;
    // Set the input value.
    this.setState({ inputValue: Mention.toContentState($.string(string).trimLeft()) }, () => {
      // Execute the callback if it exists.
      if (callback) callback();
      this.settingInput = false;
    });
  }

  /**
   * Add items to the list of messages to render.
   * @return {void}
   * @memberof MESSAGES
   */
  cacheItems() {
    // Sort the received messages.
    let orderedMessages = $.object(this.receivedMessages)
      .values()
      .sort((a, b) => (a.timeSent || 0) - (b.timeSent || 0));
    // If there are received messages, display them.
    if (orderedMessages.length) {
      this.setState({ orderedMessages }, () => {
        this.scrollBottom();
      });
    }
  }

  /**
   * Cache the users' information.
   * @return {void}
   * @memberof MESSAGES
   */
  cacheUsers() {
    let members = this.state.project.members || [];
    // Get every member of the project
    for (let member of members) {
      // If the member already exists then skip the member.
      if (this.state.cachedUsers[member.uid]) continue;
      // Otherwise get and cache the user's data.
      User.get(member.uid).then(user => {
        this.setState({
          cachedUsers: update(this.state.cachedUsers, {
            $merge: { [user.uid]: user }
          })
        });
      });
    }
  }
  /**
   * The input text field.
   * @type {Mention}
   * @memberof MESSAGES
   */
  inputElement;
  /**
   * The div thats being scrolled.
   * @type {Scrollbars}
   * @memberof MESSAGES
   */
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
          onScrollStart={() => {
            if (!this.isAnimating) {
              this.inputElement.onBlur();
              document.querySelector("div.DraftEditor-editorContainer > div").blur();
            }
          }}
          autoHide
          hideTracksWhenNotNeeded
          ref={e => (this.scrollElement = e)}
          className="messages"
          onScrollStop={(() => {
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
                .map(item => (
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
                  {"You and your team's messages will appear here."}
                  <br />
                  {"Why don't you start a conversation?"}
                </div>
              ) : (
                <div>
                  {"We're getting Messages ready."}
                  <br />
                  {"It won't take too long."}
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
                    this.setState({
                      consoleStatus: "ready"
                    });
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
                        <Mention.Nav key={item.uid} value={item.name + "#" + $.id().checkSum(item.uid)} data={item}>
                          <span style={{ color: HSL.toCSSColour(item.color) }}>
                            <Icon type="tags-o" /> {item.name}
                          </span>
                        </Mention.Nav>
                      ));
                    let relevantUsers = $.array($.object(this.state.cachedUsers).values())
                      .searchString(x => x.name, query)
                      .map(item => (
                        <Mention.Nav key={item.uid} value={item.name + "#" + $.id().checkSum(item.uid)} data={item}>
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
