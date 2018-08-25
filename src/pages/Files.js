import React, { Component } from "react";

import Fire from "../classes/Fire";

import { Card, Icon, Avatar, Button, Radio, List, Input } from "antd";
import FileUpload from "../components/FileUpload";
import FileUploadModal from "../components/FileUploadModal";
import FileDisplay from "../components/FileDisplay";
import UserGroupDisplay from "../components/UserGroupDisplay";
import Document from "../classes/Document";
import $ from "../classes/Utils";
import Project from "../classes/Project";
import User from "../classes/User";
import Columns from "react-columns";
import { Message, MessageContent } from "../classes/Messages";
const { Meta } = Card;

export default class FILES extends Component {
  static defaultProps = {
    project: null,
    user: {}
  };
  state = {
    project: {},
    user: {},
    searchResults: null,
    uploadModalVisible: false,
    view: "thumbnail",
    searchQuery: ""
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({
      searchResults: null,
      project: props.project,
      user: props.user
    });
  }

  shouldComponentUpdate(props, state) {
    if (!Project.equal(props.project, this.state.project)) return true;
    if (this.state.searchQuery !== state.searchQuery) return true;
    if (state.view !== this.state.view) return true;
    if (!User.equal(props.user, this.state.user)) return true;
    if (state.uploadModalVisible !== this.state.uploadModalVisible) return true;
    if (state.searchResults && this.state.searchResults && state.searchResults.length !== this.state.searchResults.length)
      return true;
    return false;
  }

  onExtrasButtonPress() {
    this.setState({ uploadModalVisible: true });
  }

  render() {
    let filesToRender = this.state.searchResults || this.state.project.files;
    return (
      <div>
        {this.state.project ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ textAlign: "left", maxWidth: 350, margin: "auto" }}>
              <FileUpload project={this.state.project} jobListOnly inProgressOnly />
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 350,
                margin: "auto"
              }}
            >
              <Input.Search
                key={this.state.project.projectID || "1"}
                placeholder="Search for a file"
                onChange={(e => {
                  if (e.target.value) {
                    let files = this.state.project.files || [];
                    let results = $.array(files).searchString(
                      item => (item.name || item.source.name).toLowerCase(),
                      e.target.value
                    );
                    this.setState({
                      searchResults: results,
                      searchQuery: e.target.value
                    });
                  } else {
                    this.setState({
                      searchResults: null,
                      searchQuery: e.target.value
                    });
                  }
                }).bind(this)}
              />
              <Radio.Group
                style={{
                  display: "none",
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
            {filesToRender && filesToRender.length ? (
              <div>
                {this.state.view === "thumbnail" ? (
                  <div>
                    <Columns
                      rootStyles={{ maxWidth: 950, margin: "auto" }}
                      gap={10}
                      queries={[
                        {
                          columns: Math.min((filesToRender || []).length || 1, 2),
                          query: "min-width: 1000px"
                        }
                      ]}
                    >
                      {(filesToRender || []).map((item, index) => (
                        <div key={item.uid || item.source.id}>
                          <FileDisplay
                            project={this.state.project}
                            file={item}
                            onMentionButtonPressed={() => {
                              this.props.passMessage({
                                type: "prepare-message",
                                content: new Message({
                                  readBy: { [this.state.user.uid]: true },
                                  sender: this.state.user.uid,
                                  content: new MessageContent({
                                    files: [item.uid || item.source.id],
                                    bodyText: "(Mentioned a file)"
                                  })
                                })
                              });
                            }}
                            onVersionMentionButtonPressed={versionID => {
                              this.props.passMessage({
                                type: "prepare-message",
                                content: new Message({
                                  readBy: { [this.state.user.uid]: true },
                                  sender: this.state.user.uid,
                                  content: new MessageContent({
                                    fileVersions: [versionID],
                                    bodyText: "(Mentioned a specific version of a file)"
                                  })
                                })
                              });
                            }}
                          />
                          <br />
                        </div>
                      ))}
                    </Columns>
                  </div>
                ) : (
                  <List
                    style={{
                      textAlign: "left",
                      margin: "0 2vw"
                    }}
                  >
                    {(filesToRender || []).map((item, index) => (
                      <List.Item
                        style={
                          item.files && !item.files.find(i => i.state !== "unavailable")
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
                          />
                        ]}
                      >
                        <List.Item.Meta
                          avatar={
                            item.uploadType === "cloud" ? (
                              <Avatar
                                shape="square"
                                style={{
                                  transform: "scale(0.7)",
                                  imageRendering: "crisp-edges"
                                }}
                                src={item.source.iconUrl}
                              />
                            ) : (
                              <Icon
                                style={{
                                  fontSize: 24,
                                  margin: 5,
                                  marginLeft: 0,
                                  color: "rgb(25, 144, 255)"
                                }}
                                type={Document.getFiletypeIcon(item.name)}
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
                                          .sort((a, b) => a.dateUploaded || 0 - b.dateUploaded || 0)
                                          .map((item, index) => (
                                            <List.Item key={index}>
                                              <List.Item.Meta
                                                title={`Version ${index + 1}`}
                                                description={<div>{`${new Date(item.dateUploaded).toLocaleString()}`}</div>}
                                              />
                                            </List.Item>
                                          ))
                                          .reverse()}
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
              <div style={{ opacity: 0.65, margin: 50 }}>
                <Icon type="file" />
                <br />
                <br />
                {this.state.searchResults === null
                  ? "The files you've added to this project will show up here."
                  : "No files match your search"}
                <br />
                <br />
              </div>
            )}
            <br />
            {this.state.searchResults === null && (
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  this.setState({ uploadModalVisible: true });
                }}
              >
                File
              </Button>
            )}

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
