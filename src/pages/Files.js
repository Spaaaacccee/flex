import React, { Component } from "react";

import { Icon, Button, Input } from "antd";
import FileUpload from "../components/FileUpload";
import FileUploadModal from "../components/FileUploadModal";
import FileDisplay from "../components/FileDisplay";
import $ from "../classes/Utils";
import Project from "../classes/Project";
import User from "../classes/User";
import Columns from "react-columns";
import { Message, MessageContent } from "../classes/Messages";

/**
 * Page for displaying a project's files.
 * @export
 * @class FILES
 * @extends Component
 */
export default class FILES extends Component {
  static defaultProps = {
    project: null,
    user: {}
  };
  state = {
    project: {}, // The source project.
    user: {}, // The current user.
    searchResults: null, // The resulting files from a search query.
    uploadModalVisible: false, // Whether the upload file window is visible.
    searchQuery: "" // The current search query.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Update this component with new properties.
    this.setState({
      searchResults: null,
      project: props.project,
      user: props.user
    });
  }

  shouldComponentUpdate(props, state) {
    if (!Project.equal(props.project, this.state.project)) return true;
    if (this.state.searchQuery !== state.searchQuery) return true;
    if (!User.equal(props.user, this.state.user)) return true;
    if (state.uploadModalVisible !== this.state.uploadModalVisible) return true;
    if (state.searchResults && this.state.searchResults && state.searchResults.length !== this.state.searchResults.length)
      return true;
      // Don't update this component if no properties have changed.
    return false;
  }

  onExtrasButtonPress() {
    // Display the upload window if the extras button is pressed.
    this.setState({ uploadModalVisible: true });
  }

  render() {
    // If there are search results, display search results instead.
    let filesToRender = this.state.searchResults || this.state.project.files;
    return (
      <div>
        {this.state.project ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ textAlign: "left", maxWidth: 350, margin: "auto" }}>
              {/* Display the currently ongoing file uploads */}
              <FileUpload project={this.state.project} jobListOnly inProgressOnly />
            </div>
            <div
              style={{
                display: "flex",
                maxWidth: 350,
                margin: "auto"
              }}
            >
              {/* Search for files */}
              <Input.Search
                key={this.state.project.projectID || "1"}
                placeholder="Search for a file"
                onChange={(e => {
                  if (e.target.value) {
                    let files = this.state.project.files || [];
                    // If there is a search query, search for relevant files.
                    let results = $.array(files).searchString(
                      item => (item.name || item.source.name).toLowerCase(),
                      e.target.value
                    );
                    // Update this page with the new search results. 
                    this.setState({
                      searchResults: results,
                      searchQuery: e.target.value
                    });
                  } else {
                    // Otherwise, display all files instead.
                    this.setState({
                      searchResults: null,
                      searchQuery: e.target.value
                    });
                  }
                }).bind(this)}
              />
            </div>
            <br />
            {filesToRender && filesToRender.length ? (
              // If there are files to render, then render them
              <div>
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
                      {(filesToRender || []).map((item) => (
                        // Display each file.
                        <div key={item.uid || item.source.id}>
                          <FileDisplay
                            project={this.state.project}
                            file={item}
                            onMentionButtonPressed={() => {
                              // Prepare and send a message when a file is mentioned.
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
                              // Prepare and send a message when a specific version of a file is mentioned.
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
              </div>
            ) : (
              // Otherwise, show an error message.
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
              // Display an add file button.
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
