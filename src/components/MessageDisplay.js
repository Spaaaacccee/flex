import React, { Component } from "react";
import { List, Popover, Icon, Popconfirm, Button, Avatar, Card } from "antd";
import User from "../classes/User";
import Messages from "../classes/Messages";
import $ from "../classes/Utils";
import MemberDisplay from "./MemberDisplay";
import { HSL } from "../classes/Role";
import FileDisplay from "./FileDisplay";
import HistoryDisplay from "./HistoryDisplay";
import FileVersionDisplay from "./FileVersionDisplay";
import Project from "../classes/Project";
import Document from "../classes/Document";
import UserGroupDisplay from "./UserGroupDisplay";
import TimelineItem from "./TimelineItem";

class MessageDisplay extends Component {
  static defaultProps = {
    onQuotePressed: () => {},
    onEditPressed: () => {},
    onDeletePressed: () => {},
    onReady: () => {}
  };
  state = {
    user: {},
    project: {},
    messageID: null,
    messenger: null,
    message: null,
    sender: {},
    status: null,
    hashedMembers: {},
    hashedRoles: {},
    readOnly: false
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  shouldComponentUpdate(props, state) {
    if (props.readOnly !== this.state.readOnly) return true;
    if (!User.equal(props.user, this.state.user)) return true;
    if (!Project.equal(props.project, this.state.project)) return true;
    if (this.state.status !== props.status) return true;
    if (this.state.messageID !== props.messageID) return true;
    if ((state.sender || {}).uid !== (this.state.sender || {}).uid) return true;
    if ((this.state.messenger || {}).uid !== (state.messenger || {}).uid)
      return true;
    if ((props.message || {}).uid !== (this.state.message || {}).uid)
      return true;
    return false;
  }

  componentWillReceiveProps(props) {
    this.setState({
      user: props.user,
      project: props.project,
      messageID: props.messageID,
      status: props.status,
      readOnly: props.readOnly
    });
    if (props.project) {
      this.setState({
        hashedMembers: (() => {
          let x = {};
          (props.project.members || []).forEach(item => {
            x[$.id().checkSum(item.uid)] = item;
          });
          return x;
        })(),
        hashedRoles: (() => {
          let x = {};
          (props.project.roles || []).forEach(item => {
            x[$.id().checkSum(item.uid)] = item;
          });
          return x;
        })()
      });
    }
    if (props.message) {
      this.setState({ message: props.message }, () => {
        this.props.onReady();
      });
      User.get(props.message.sender).then(sender => {
        this.setState({ sender });
      });
    } else {
      if (
        !this.state.messenger ||
        props.project.messengerID !== this.state.messenger.uid
      ) {
        this.setState({ messenger: null });
        Messages.get(props.project.messengerID).then(messenger => {
          if (messenger && props.messageID) {
            if (messenger.messages[props.messageID]) {
              User.get(messenger.messages[props.messageID].sender).then(
                sender => {
                  this.setState({ messenger, sender }, () => {
                    this.props.onReady();
                  });
                }
              );
            }
          }
        });
      }
    }
  }

  render() {
    const item =
      this.state.message ||
      (this.state.messenger
        ? this.state.messenger.messages[this.state.messageID]
        : null);
    return item && item.content ? (
      (() => {
        let ref;
        let sender = this.state.sender;
        return (
          <List.Item
            onContextMenu={e => {
              if(this.state.readOnly) return;
              if (!window.getSelection().toString()) {
                e.preventDefault();
                ref.tooltip.setState({
                  visible: true
                });
              }
            }}
            style={Object.assign(
              { textAlign: "left" },
              this.state.messageStatus === "processing"
                ? { opacity: 0.65, pointerEvents: "none" }
                : {}
            )}
          >
            <div style={{ display: "flex" }}>
              <Popover
                trigger="click"
                content={
                  this.state.project && this.state.project.members ? (
                    <MemberDisplay
                      member={this.state.project.members.find(
                        x => x.uid === item.sender
                      )}
                      project={this.state.project}
                      readOnly
                      cardless
                    />
                  ) : null
                }
              >
                <Avatar
                  src={(this.state.sender || {}).profilePhoto}
                  style={{
                    marginRight: 10,
                    flex: "none",
                    cursor: "pointer"
                  }}
                />
              </Popover>
              <div style={{ display: "inline-block", flex: 1 }}>
                <List.Item.Meta
                  title={
                    <span
                      style={{
                        marginBottom: 5,
                        fontSize: 16,
                        display: "inline-block",
                        color: HSL.toCSSColor(
                          (
                            (this.state.project.roles || []).find(
                              role =>
                                role.uid ===
                                ((
                                  this.state.project.members.find(
                                    member => member.uid === item.sender
                                  ).roles || []
                                ).find(x => x === role.uid) || {})
                            ) || {}
                          ).color || { h: 0, s: 0, l: 15 }
                        )
                      }}
                    >
                      {(sender || {}).name || <Icon type="loading" />}
                      <Popover
                        ref={e => (ref = e)}
                        placement="topRight"
                        trigger="click"
                        key={0}
                        content={
                          <div>
                            <List style={{ margin: "-5px 0" }} size="small">
                              <List.Item>
                                <a
                                  onClick={() => {
                                    this.props.onQuotePressed();
                                    ref.tooltip.setState({
                                      visible: false
                                    });
                                  }}
                                >
                                  <Icon type="message" />
                                  {" Quote"}
                                </a>{" "}
                              </List.Item>

                              {item.sender === this.state.user.uid && (
                                <List.Item>
                                  <a
                                    onClick={() => {
                                      this.props.onEditPressed();
                                      ref.tooltip.setState({
                                        visible: false
                                      });
                                    }}
                                  >
                                    <Icon type="edit" />
                                    {" Edit"}
                                  </a>
                                </List.Item>
                              )}
                              <Popconfirm
                                placement="topRight"
                                title="Delete this message?"
                                okText="Yes"
                                cancelText="No"
                                onConfirm={() => {
                                  this.props.onDeletePressed();
                                }}
                              >
                                <List.Item>
                                  <a>
                                    <Icon type="delete" />
                                    {" Delete"}
                                  </a>
                                </List.Item>
                              </Popconfirm>
                            </List>
                          </div>
                        }
                      >
                        <Button
                          style={{
                            visibility: this.state.readOnly ? "hidden" : "visible",
                            border: 0,
                            background: "transparent",
                            position: "absolute",
                            right: 0
                          }}
                          icon="ellipsis"
                          shape="circle"
                          size="small"
                        />
                      </Popover>
                    </span>
                  }
                  description={$.string(
                    $.date(item.timeSent).humanise(true)
                  ).capitaliseFirstLetter()}
                />
                <div
                  style={{
                    maxWidth: 400,
                    width: "calc(100vw - 80px)",
                    MozUserSelect: "none",
                    WebkitUserSelect: "none",
                    msUserSelect: "none"
                  }}
                >
                  {!this.state.readOnly && ((!!item.content.files && item.content.files.length) ||
                    (!!item.content.histories &&
                      !!item.content.histories.length) ||
                    (!!item.content.fileVersions &&
                      !!item.content.fileVersions.length) ||
                      (!!item.content.events &&
                        !!item.content.events.length)) && (
                    <div>
                    {!!item.content.events && item.content.events.map(eventID=>{
                      let event = (this.state.project.events||[]).find(x=>x.uid===eventID);
                      return (
                        <div>
                          {event ? (
                            <div>
                              <br />
                              <TimelineItem
                                readOnly
                                project={this.state.project}
                                user={this.state.user}
                                event={event}
                              />
                            </div>
                          ) : (
                            <div>
                              <br />
                              <Card>
                                <div
                                  style={{
                                    opacity: 0.65,
                                    margin: "auto",
                                    textAlign: "center"
                                  }}
                                >
                                  {
                                    "We can not display this event because it has been deleted."
                                  }
                                </div>
                              </Card>
                            </div>
                          )}
                        </div>
                      );
                    })}
                      {!!item.content.files &&
                        item.content.files.map(fileID => {
                          let file;
                          if (fileID) {
                            file = (this.state.project.files || []).find(
                              x => x.uid === fileID
                            );
                            if (!file)
                              file = (this.state.project.files || [])
                                .filter(x => x.uploadType === "cloud")
                                .find(x => x.source.id === fileID);
                          }
                          return (
                            <div>
                              {file ? (
                                <div>
                                  <br />
                                  <FileDisplay
                                    readOnly
                                    project={this.state.project}
                                    file={file}
                                  />
                                </div>
                              ) : (
                                <div>
                                  <br />
                                  <Card>
                                    <div
                                      style={{
                                        opacity: 0.65,
                                        margin: "auto",
                                        textAlign: "center"
                                      }}
                                    >
                                      {
                                        "We can not display this file because it has been deleted."
                                      }
                                    </div>
                                  </Card>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      {!!item.content.histories &&
                        item.content.histories.map(historyID => {
                          let historyItem = (
                            this.state.project.history || []
                          ).find(x => x.uid === historyID);
                          return historyItem ? (
                            <div>
                              <br />
                              <HistoryDisplay
                                readOnly
                                user={this.state.user}
                                project={this.state.project}
                                item={historyItem}
                                onMessage={msg => {
                                  this.props.passMessage(msg);
                                }}
                              />
                            </div>
                          ) : (
                            <div />
                          );
                        })}
                      {!!item.content.fileVersions &&
                        item.content.fileVersions.map(versionID => {
                          let file;
                          for (let item of this.state.project.files || []) {
                            if (item.files) {
                              file = item.files.find(x => x.uid === versionID);
                              if (file) break;
                            }
                          }
                          return file ? (
                            <div>
                              <br />
                              <Card>
                                <Card.Meta
                                  title={
                                    <span
                                      style={{
                                        display: "flex",
                                        alignItems: "center"
                                      }}
                                    >
                                      <Icon
                                        style={{
                                          color: "rgb(25, 144, 255)",
                                          fontSize: 24,
                                          fontWeight: "normal",
                                          flex: "none"
                                        }}
                                        type={Document.getFiletypeIcon(
                                          file.name
                                        )}
                                      />
                                      <span
                                        style={{
                                          marginLeft: 10
                                        }}
                                      >
                                        {file.name}
                                      </span>
                                    </span>
                                  }
                                />
                                <br />
                                <List bordered>
                                  <FileVersionDisplay
                                    readOnly
                                    project={this.state.project}
                                    item={file}
                                  />
                                </List>
                              </Card>
                            </div>
                          ) : (
                            <div />
                          );
                        })}
                      <br />
                    </div>
                  )}
                </div>
                <pre
                  style={{
                    marginTop: 10,
                    whiteSpace: "pre-wrap",
                    display: "inline",
                    fontFamily: `"Segoe UI",
  "BlinkMacSystemFont", "Helvetica Neue", "Noto Sans", "Roboto", Arial,
  Helvetica, "PingFang SC", "Microsoft YaHei UI", sans-serif`
                  }}
                >
                  {(() => {
                    let source = " " + (item.content || {}).bodyText + " ";
                    let tokens = source.match(/@.*?#\d\d\d\d\s/g) || [];
                    let text = source.split(/@.*?#\d\d\d\d\s/g);
                    if (tokens.length) {
                      let str = [];
                      text.forEach((item, index) => {
                        str.push(index ? item : item.substring(1));
                        if (tokens[index]) {
                          let hash = tokens[index]
                            .split("#")
                            .pop()
                            .trim();
                          if (this.state.hashedMembers[hash]) {
                            str.push(
                              <UserGroupDisplay
                                style={{
                                  display: "inline-block",
                                  marginBottom: "-8px"
                                }}
                                project={this.state.project}
                                people={{
                                  members: [this.state.hashedMembers[hash].uid]
                                }}
                              />
                            );
                          } else if (this.state.hashedRoles[hash]) {
                            str.push(
                              <UserGroupDisplay
                                style={{
                                  display: "inline-block",
                                  marginBottom: "-8px"
                                }}
                                project={this.state.project}
                                people={{
                                  roles: [this.state.hashedRoles[hash].uid]
                                }}
                              />
                            );
                          } else {
                            str.push(tokens[index]);
                          }
                        }
                      });
                      return str;
                    } else {
                      return source.trim();
                    }
                  })()}
                </pre>{" "}
                <span style={{ color: "rgb(25, 144, 255)" }}>
                  {this.state.status === "processing" && (
                    <Icon type="loading" />
                  )}
                  {this.state.status === "sent" && <Icon type="check" />}
                </span>
              </div>
            </div>
          </List.Item>
        );
      })()
    ) : (
      <div />
    );
  }
}

export default MessageDisplay;
