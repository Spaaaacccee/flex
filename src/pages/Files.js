import React, { Component } from "react";

import Fire from "../classes/Fire";

import { Card, Icon, Avatar, Button, Radio, List, Input } from "antd";
import FileUpload from "../components/FileUpload";
import FileUploadModal from "../components/FileUploadModal";
import FileDisplay from "../components/FileDisplay";
import UserGroupDisplay from "../components/UserGroupDisplay";
import Document from "../classes/Document";
const { Meta } = Card;

export default class FILES extends Component {
  static defaultProps = {
    project: null,
    user: {}
  };
  state = {
    project: {},
    user: {},
    uploadModalVisible: false,
    view: "thumbnail"
  };
  componentWillReceiveProps(props) {
    this.setState({ project: props.project, user: props.user });
  }
  onExtrasButtonPress() {
    this.setState({ uploadModalVisible: true });
  }
  render() {
    return (
      <div>
        {this.state.project ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ textAlign: "left", maxWidth: 350, margin: "auto" }}>
              <FileUpload
                project={this.state.project}
                jobListOnly
                inProgressOnly
              />
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 350,
                margin: "auto"
              }}
            >
              <Input.Search
                placeholder="Search for a file"
                style={{ marginRight: 10 }}
              />
              <Radio.Group
                style={{
                  flex: "none"
                }}
                value={this.state.view}
                onChange={(e => {
                  this.setState({ view: e.target.value });
                }).bind(this)}
              >
                <Radio.Button value="thumbnail">
                  <Icon type="appstore-o" />
                </Radio.Button>
                <Radio.Button value="list">
                  <Icon type="bars" />
                </Radio.Button>
              </Radio.Group>
            </div>
            <br />
            {this.state.project.files && this.state.project.files.length ? (
              <div>
                {this.state.view === "thumbnail" ? (
                  (this.state.project.files || []).map((item, index) => (
                    <div key={index}>
                      <FileDisplay project={this.state.project} file={item} />
                    </div>
                  ))
                ) : (
                  <List
                    style={{
                      textAlign: "left",
                      margin: "0 2vw"
                    }}
                  >
                    {(this.state.project.files || []).map((item, index) => (
                      <List.Item
                        style={
                          item.files &&
                          !item.files.find(i => i.state !== "unavailable")
                            ? {
                                opacity: 0.65,
                                pointerEvents: "none"
                              }
                            : {}
                        }
                        key={index}
                        actions={[
                          <Button
                            type="primary"
                            shape="circle"
                            icon="export"
                            onClick={() => {
                              Document.tryPreviewWindow(item);
                            }}
                          />,
                          <Button shape="circle" icon="ellipsis" />
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            item.uploadType === "cloud" ? (
                              <Avatar
                                shape="square"
                                style={{
                                  transform: "scale(0.7)",
                                  imageRendering: "pixelated"
                                }}
                                src={item.source.iconUrl}
                              />
                            ) : (
                              <Icon
                                style={{
                                  fontSize: 24,
                                  margin: 5,
                                  marginLeft: 0
                                }}
                                type="file"
                              />
                            )
                          }
                          title={item.name || item.source.name}
                          description={
                            item.uploadType === "cloud" ? (
                              <span>
                                <Icon type="cloud-o" />
                                {" Stored in the cloud"}
                              </span>
                            ) : (
                              <div>
                                {`${item.files.length} versions`}
                                {!!item.files &&
                                  item.files.length > 1 && (
                                    <div>
                                      <br />
                                      <List
                                        style={{
                                          borderTop: "1px solid #e8e8e8"
                                        }}
                                      >
                                        {item.files
                                          .sort(
                                            (a, b) =>
                                              a.dateModified === b.dateModified
                                                ? 0
                                                : a.dateModified >
                                                  b.dateModified
                                                  ? 1
                                                  : -1
                                          )
                                          .map((item, index) => (
                                            <List.Item key={index}>
                                              <List.Item.Meta
                                                title={`Version ${index + 1}`}
                                                description={
                                                  <div>
                                                    {`${new Date(
                                                      item.dateUploaded
                                                    ).toLocaleString()}`}
                                                  </div>
                                                }
                                              />
                                            </List.Item>
                                          ))}
                                      </List>
                                    </div>
                                  )}
                              </div>
                            )
                          }
                        />
                      </List.Item>
                    ))}
                  </List>
                )}
              </div>
            ) : (
              <div style={{ opacity: 0.65 }}>
                <Icon type="file" />
                <br />This project has no files.<br />
                <br />
              </div>
            )}
            <Button
              icon="plus"
              onClick={() => {
                this.setState({ uploadModalVisible: true });
              }}
            >
              File
            </Button>
            <FileUploadModal
              onClose={() => {
                this.setState({ uploadModalVisible: false });
              }}
              project={this.state.project}
              visible={this.state.uploadModalVisible}
            />
          </div>
        ) : (
          <Icon type="loading" />
        )}
      </div>
    );
  }
}
