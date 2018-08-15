import React, { Component } from "react";
import { Card, Icon, Button, List, Avatar, Popconfirm } from "antd";
import UserGroupDisplay from "./UserGroupDisplay";
import Fire from "../classes/Fire";
import Document from "../classes/Document";
import Project from "../classes/Project";
class FileDisplay extends Component {
  state = {
    project: {},
    file: {},
    readOnly: false,
    deleting: false
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  shouldComponentUpdate(props, state) {
    if (!Project.equal(props.project, this.state.project)) return true;
    if (props.readOnly !== this.state.readOnly) return true;
    if (state.deleting !== this.state.deleting) return true;
    if (!this.state.file) return true;
    if (props.file) {
      if (props.file.source) {
        if (props.file.source.id !== this.state.file.source.id) return true;
        return false;
      }
      if (props.file.uid !== this.state.file.uid) return true;
      if (props.file.files.length !== this.state.file.files.length) return true;
    }
    return false;
  }

  componentWillReceiveProps(props) {
    this.setState({
      project: props.project,
      file: props.file,
      readOnly: props.readOnly
    });
  }

  render() {
    let isUnavailable =
      this.state.file.files &&
      !this.state.file.files.find(i => i.state !== "unavailable");
    return (
      <div style={{ textAlign: "left" }}>
        {
          <Card
            style={Object.assign(
              {},
              this.state.deleting
                ? {
                    opacity: 0.65,
                    pointerEvents: "none"
                  }
                : isUnavailable
                  ? { opacity: 0.65 }
                  : {}
            )}
            /*cover={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 200,
                  background: "#3CA7FF",
                  flexDirection: "column"
                }}
              >
                {this.state.file.uploadType === "cloud" ? (
                  <div
                    style={{
                      width: "100%",
                      height: 200,
                      overflow: "hidden",
                      background: "black"
                    }}
                  >
                    <iframe
                      style={{
                        background: "white",
                        boxShadow: 'inset 0px -10px 20px -10px rgba(0, 0, 0, 0.1)'
                      }}
                      src={this.state.file.source.embedUrl}
                      width="100%"
                      height="200px"
                      frameBorder="0"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center"
                    }}
                  >
                    <Icon
                      type="file"
                      style={{ fontSize: 24, color: "white" }}
                    />
                    <div style={{ height: 10 }} />
                    <p style={{ color: "white" }}>
                      We could not connect to previews.
                    </p>
                  </div>
                )}
              </div>
            } */
            actions={(() => {
              const previewButton = (
                <span
                  onClick={() => {
                    Document.tryPreviewWindow(this.state.file);
                  }}
                >
                  <Icon type="export" />
                  {" Open"}
                </span>
              );
              const mentionButton = (
                <span>
                  <Icon type="paper-clip" />
                  {" Mention"}
                </span>
              );
              const deleteButton = (
                <Popconfirm
                  title={
                    this.state.file.uploadType === "cloud" ||
                    (this.state.file.files || []).length === 1
                      ? "This file will be deleted"
                      : `${
                          (this.state.file.files || []).length
                        } files will be deleted`
                  }
                  okText="OK"
                  okType="danger"
                  cancelText="Cancel"
                  onConfirm={() => {
                    this.setState({ deleting: true }, () => {
                      this.state.project.tryDelete(this.state.file);
                    });
                  }}
                >
                  <span style={{ color: "rgb(255, 77, 79)" }}>
                    <Icon type={this.state.deleting ? "loading" : "delete"} />
                    {this.state.deleting ? " Deleting" : " Delete"}
                  </span>
                </Popconfirm>
              );
              if (this.state.deleting) return [deleteButton];
              if (this.state.readOnly) return [previewButton];
              if (isUnavailable) return [deleteButton];
              return [previewButton, mentionButton, deleteButton];
            })()}
          >
            {this.state.file.uid || this.state.file.source ? (
              <Card.Meta
                title={
                  this.state.file.uploadType === "cloud"
                    ? this.state.file.source.name
                    : this.state.file.name
                }
                avatar={
                  this.state.file.uploadType === "cloud" ? (
                    <Avatar
                      shape="square"
                      style={{
                        transform: "scale(0.6)",
                        imageRendering: "pixelated"
                      }}
                      src={this.state.file.source.iconUrl}
                    />
                  ) : (
                    <Icon
                      style={{
                        fontSize: 24,
                        margin: 5,
                        marginLeft: 0
                      }}
                      type={Document.getFiletypeIcon(this.state.file.name)}
                    />
                  )
                }
                description={
                  <div>
                    {(this.state.file.type === "cloud" ||
                      (this.state.file.files || []).length === 1) && (
                      <UserGroupDisplay
                        project={this.state.project}
                        people={{
                          members: [
                            (
                              (this.state.file.files || []).sort(
                                (a, b) => b.dateUploaded - a.dateUploaded
                              )[0] || {}
                            ).uploader
                          ]
                        }}
                      />
                    )}
                    {this.state.file.uploadType === "cloud" ? (
                      <span>
                        <Icon type="cloud-o" />
                        {" Stored in the cloud"}
                      </span>
                    ) : (
                      <div>
                        {isUnavailable
                          ? "One or more versions of this file is unavailable"
                          : this.state.file.files.sort(
                              (a, b) => b.dateUploaded - a.dateUploaded
                            )[0].description ||
                            (this.state.file.files.length > 1
                              ? `${this.state.file.files.length} versions`
                              : "")}
                      </div>
                    )}
                  </div>
                }
              />
            ) : (
              <Icon type="loading" />
            )}
            {this.state.file.uploadType !== "cloud" &&
            this.state.file.files &&
            this.state.file.files.length > 1 ? (
              <div>
                <br />
                <List bordered>
                  {this.state.file.files
                    .sort((a, b) => b.dateUploaded - a.dateUploaded)
                    .map((item, index) => (
                      <List.Item
                        key={item.uid || item.source.uid}
                        actions={[
                          <Popconfirm
                            title="This file will be deleted"
                            okText="OK"
                            okType="danger"
                            cancelText="Cancel"
                            onConfirm={() => {
                              this.setState({ deleting: true }, () => {
                                this.state.project
                                  .deleteFile(this.state.file.uid, item.uid)
                                  .then(() => {
                                    this.setState({ deleting: false });
                                  });
                              });
                            }}
                          >
                            <Icon
                              style={{ color: "rgb(255, 77, 79)" }}
                              type="delete"
                            />
                          </Popconfirm>,
                          <a>
                            <Icon
                              type="export"
                              onClick={() => {
                                Document.tryPreviewWindow(item);
                              }}
                            />
                          </a>
                        ]}
                      >
                        <List.Item.Meta
                          title={item.description || `No comments`}
                          description={
                            <div>
                              {[
                                `${new Date(
                                  item.dateUploaded
                                ).toLocaleString()}`,
                                `${item.size} bytes`
                              ].map((x, i) => (
                                <div key={i}>{x}</div>
                              ))}
                              <div>
                                <UserGroupDisplay
                                  people={{ members: [item.uploader] }}
                                  project={this.state.project}
                                />
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    ))}
                </List>
              </div>
            ) : (
              ""
            )}
          </Card>
        }
      </div>
    );
  }
}

export default FileDisplay;
