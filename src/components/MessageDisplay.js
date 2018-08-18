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
    status: null
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  shouldComponentUpdate(props, state) {
    if (!User.equal(props.user, this.state.user)) return true;
    if (!Project.equal(props.project, this.state.project)) return true;
    if (this.state.status !== props.status) return true;
    if (this.state.messageID !== props.messageID) return true;
    if ((state.sender || {}.uid) !== (this.state.sender || {}).uid) return true;
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
      status: props.status
    });
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
    return item ? (
      (() => {
        let ref;
        let sender = this.state.sender;
        return (
          <List.Item
            onContextMenu={e => {
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
            extra={[
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
                    border: 0,
                    background: "transparent"
                  }}
                  icon="ellipsis"
                  shape="circle"
                  size="small"
                />
              </Popover>
            ]}
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
                    </span>
                  }
                  description={$.date(item.timeSent).humanise()}
                />
                <div
                  style={{
                    maxWidth: 450
                  }}
                >
                  {(!!item.content.files ||
                    !!item.content.histories ||
                    !!item.content.fileVersions) && (
                    <div>
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
                                <Card>
                                  <div
                                    style={{ opacity: 0.65, margin: "auto", textAlign: 'center' }}
                                  >
                                    {
                                      "We can not display this file because it has been deleted."
                                    }
                                  </div>
                                </Card>
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
                                    <span>
                                      <Icon
                                        style={{
                                          color: "rgb(25, 144, 255)",
                                          fontSize: 24,
                                          fontWeight: "normal"
                                        }}
                                        type={Document.getFiletypeIcon(
                                          file.name
                                        )}
                                      />
                                      <span
                                        style={{
                                          verticalAlign: "top",
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
                    whiteSpace: "pre-wrap",
                    display: "inline",
                    fontFamily: `"Segoe UI",
  "BlinkMacSystemFont", "Helvetica Neue", "Noto Sans", "Roboto", Arial,
  Helvetica, "PingFang SC", "Microsoft YaHei UI", sans-serif`
                  }}
                >
                  {(item.content || {}).bodyText}
                </pre>{" "}
                <span style={{ color: "rgb(25, 144, 255)" }}>
                  {this.state.status === "processing" && (
                    <Icon type="loading" />
                  )}{" "}
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
