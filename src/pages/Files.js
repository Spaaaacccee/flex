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
    view: "thumbnail"
  };
  componentWillReceiveProps(props) {
    if (Project.equal(props.project, this.state.project)) return;
    this.setState({
      searchResults: null,
      project: props.project,
      user: props.user
    });
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
                key={this.state.project.projectID || "1"}
                placeholder="Search for a file"
                style={{ marginRight: 10 }}
                onChange={(e => {
                  if (e.target.value) {
                    let files = this.state.project.files || [];
                    let results = $
                      .array(files)
                      .searchString(
                        item => (item.name || item.source.name).toLowerCase(),
                        e.target.value
                      );
                    this.setState({ searchResults: results });
                  } else {
                    this.setState({ searchResults: null });
                  }
                }).bind(this)}
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
            {filesToRender && filesToRender.length ? (
              <div>
                {this.state.view === "thumbnail" ? (
                  (filesToRender || []).map((item, index) => (
                    <div key={item.uid || item.source.id}>
                      <FileDisplay project={this.state.project} file={item} readOnly/>
                      <br/>
                    </div>
                  ))
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
                                  imageRendering: "crisp-edges"
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
                                          )).reverse()}
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
                  ? `The files you've added to this project will show up here.`
                  : `No files match your search`}
                <br />
                <br />
              </div>
            )}
            <Button
              icon="plus"
              type="primary"
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
