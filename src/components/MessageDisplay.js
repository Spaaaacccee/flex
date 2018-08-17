import React, { Component } from "react";
import { List, Popover, Icon, Popconfirm, Button, Avatar } from "antd";
import User from "../classes/User";
import Messages from "../classes/Messages";
import $ from '../classes/Utils';
import MemberDisplay from "./MemberDisplay";
import { HSL } from "../classes/Role";
import FileDisplay from "./FileDisplay";
import HistoryDisplay from "./HistoryDisplay";

class MessageDisplay extends Component {
  static defaultProps = {
    onQuotePressed:()=>{},
    onEditPressed:()=>{},
    onDeletePressed:()=>{},
  }
  state = {
    user: {},
    project: {},
    messageID: null,
    messenger: null,
    message:null,
    sender: {},
    status: null
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({
      user: props.user,
      project: props.project,
      messageID: props.messageID,
      status: props.status
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
    const item = this.state.message||(this.state.messenger?this.state.messenger.messages[this.state.messageID]:null)
    return item ? (()=>{
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
                  src={
                    (this.state.sender || {})
                      .profilePhoto
                  }
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
                                    member =>
                                      member.uid === item.sender
                                  ).roles || []
                                ).find(x => x === role.uid) || {})
                            ) || {}
                          ).color || { h: 0, s: 0, l: 15 }
                        )
                      }}
                    >
                      {(sender || {})
                        .name || <Icon type="loading" />}
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
                    !!item.content.histories) && (
                    <div>
                      <br />
                      {!!item.content.files &&
                        item.content.files.map(fileID => {
                          let file;
                          if (fileID) {
                            file = (
                              this.state.project.files || []
                            ).find(x => x.uid === fileID);
                            if (!file)
                              file = (this.state.project.files || [])
                                .filter(x => x.uploadType === "cloud")
                                .find(x => x.source.id === fileID);
                          }
                          return (
                            <div>
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
                        })}
                      {!!item.content.histories &&
                        item.content.histories.map(historyID => {
                          let historyItem = (
                            this.state.project.history || []
                          ).find(x => x.uid === historyID);
                          return historyItem ? (
                            <div>
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
                {this.state.status ===
                  "processing" && <Icon type="loading" />}{" "}
                {this.state.status === "sent" && (
                  <Icon type="check" />
                )}
              </div>
            </div>
          </List.Item>
        );
    })() : <div></div>;
  }
}

export default MessageDisplay;
