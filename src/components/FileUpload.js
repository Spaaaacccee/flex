import React, { Component } from "react";
import { Upload, Icon, message, Button, List, Progress, Modal, Input } from "antd";
import Document, { UploadJob } from "../classes/Document";
import $ from "../classes/Utils";

export default class FileUpload extends Component {
  state = {
    project: {},
    jobs: [], // A list of all the uploading jobs to display.
    jobListOnly: false, // Whether to display only the job list, and no way to upload a file.
    inProgressOnly: false, // Whether the job list should only display jobs that are ongoing.
    selectedFile: {}, // The currently selected file to upload.
    modalVisible: false, // Whether the add a description window is open.
    description: "", // The description for the file entered by the user.
    loading: false, // Whether the file upload component is loading
    specifyFileName: null // Whether a file name is specified, and what it is.
  };

  /**
   * Copy the jobs listed in the job manager to this component
   * @return {void}
   * @memberof FileUpload
   */
  updateFiles() {
    this.setState({ jobs: UploadJob.Jobs.allJobs });
  }

  componentWillReceiveProps(props) {
    this.setState({
      project: props.project,
      jobListOnly: !!props.jobListOnly,
      inProgressOnly: !!props.inProgressOnly,
      specifyFileName: props.specifyFileName
    });
  }

  componentDidMount() {
    // Add a listener to update this component when the job list changes.
    UploadJob.Jobs.on("job_changed", this.updateFiles.bind(this));
    this.componentWillReceiveProps(this.props);
    this.updateFiles();
  }

  componentWillUnmount() {
    // Remove the listener for when the job list changes.
    UploadJob.Jobs.off("job_changed", this.updateFiles.bind(this));
  }

  render() {
    // Set the jobs to render to only uploading jobs if specified.
    const renderJobs = this.state.jobs.filter(item => !this.state.inProgressOnly || item.status === "uploading");
    return (
      <div>
        {!this.state.jobListOnly && (
          // If the settings does not disable uploading, show the uploader.
          <div>
            <Upload.Dragger
              customRequest={({ file }) => {
                // What to do when a file is selected:

                // If the file name is specified, and the extension doesn't match the specified file name's extension, prevent uploading.
                if (
                  this.state.specifyFileName &&
                  this.state.specifyFileName
                    .split(".")
                    .pop()
                    .toLowerCase() !==
                    file.name
                      .split(".")
                      .pop()
                      .toLowerCase()
                ) {
                  message.error(
                    `We only allow files of the same format to be merged. Instead, you should upload ${
                      file.name
                    } as a separate file.`
                  );
                  return;
                }

                // Otherwise, if the file size is larger than 50 MB, prevent uplading.
                if (file.size > 1024 * 1024 * 50) {
                  message.error(`${file.name} is larger than the maximum allowed file size (50 MB).`);
                  return;
                }

                // Test if the file size is a multiple of 4096, since all folders have this property.
                if (file.size % 4096 === 0) {
                  let reader = new FileReader();
                  // If the file has such a size, read the file to check if its a folder. This may take time, which is why the file size check is performed first.
                  reader.onload = () => {
                    // Otherwise, select the file, and go to the next step.
                    this.setState({
                      selectedFile: file,
                      modalVisible: true,
                      loading: false
                    });
                  };
                  reader.onerror = () => {
                    message.error("Unfortunately, we currently don't support uploading folders.");
                  };
                  reader.readAsText(file);
                  return;
                }

                // Otherwise, select the file, and go to the next step.
                this.setState({
                  selectedFile: file,
                  modalVisible: true,
                  loading: false
                });
              }}
              fileList={[]}
            >
              {/* The file upload area */}
              <p className="ant-upload-drag-icon">
                <Icon type="plus" />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
            </Upload.Dragger>
          </div>
        )}
        <div>
          {!!renderJobs.length && (
            // If there are jobs to display, then display them
            <div>
              <br />
              <List bordered>
                {renderJobs.map(item => (
                  // A single job
                  <List.Item
                    key={item.uid}
                    actions={
                      item.status === "done" || item.status === "canceled"
                        ? null
                        : [
                            // If a job is not done or canceled, then display an option to cancel.
                            <Icon
                              key={0}
                              type="close"
                              onClick={() => {
                                // Cancel the job
                                item.cancelJob();
                                // Refresh the files so that the canceled job is reflected in the UI
                                this.updateFiles();
                              }}
                            />
                          ]
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        // File icon
                        <Icon
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "block",
                            fontSize: 24,
                            margin: 5,
                            marginLeft: 0,
                            color: "rgb(25, 144, 255)"
                          }}
                          type={Document.getFiletypeIcon(item.name)}
                        />
                      }
                      title={item.name}
                      description={
                        // Progress bar
                        <div>
                          <span style={{ textTransform: "capitalize" }}>{item.status}</span>
                          <span>
                            <Progress
                              percent={
                                item.status === "done" || item.status === "error" ? 100 : Math.min(Math.round(item.percent), 99)
                              }
                              status={
                                item.status === "done"
                                  ? "success"
                                  : item.status === "error"
                                    ? "exception"
                                    : item.status === "canceled"
                                      ? "exception"
                                      : "active"
                              }
                            />
                          </span>
                        </div>
                      }
                    />
                  </List.Item>
                ))}
              </List>
              <br />
            </div>
          )}
        </div>
        {/* Window for uploading new versions of files. */}
        <Modal
          wrapClassName="secondary-modal"
          destroyOnClose
          getContainer={() => document.querySelector(".modal-mount > div:first-child")}
          visible={this.state.modalVisible}
          onCancel={() => {
            // When the modal is closed, then clear the selected file and the description that is entered.
            this.setState({
              selectedFile: {},
              modalVisible: false,
              description: ""
            });
          }}
          footer={[
            // Submit button
            <Button
              key={0}
              icon="check"
              loading={this.state.loading}
              type="primary"
              onClick={() => {
                // What to do when the user clicks submit.

                // Display the loading icon
                this.setState({ loading: true }, () => {
                  // Add the file.
                  this.state.project.addFile(
                    this.state.selectedFile,
                    // Trim the name so that it doesn't start or end with spaces. If the result is empty, use a generic description.
                    this.state.description.trim() || `Made changes to ${this.state.selectedFile.name}`,
                    () => {
                      // Clear the current selected file and description.
                      this.setState({
                        selectedFile: {},
                        modalVisible: false,
                        description: ""
                      });
                      // Refresh the files so that the canceled job is reflected in the UI.
                      this.updateFiles();
                    },
                    this.state.specifyFileName
                  );
                });
              }}
            >
              Done
            </Button>
          ]}
        >
          <div style={{ textAlign: "center", marginTop: 20 }}>
            {/* A large file icon for aesthetics. */}
            <Icon
              type={Document.getFiletypeIcon(this.state.selectedFile.name || "")}
              style={{
                fontSize: 48,
                color: "rgb(24, 144, 255)",
                marginBottom: 10
              }}
            />
            <h2>{this.state.selectedFile.name || ""}</h2>
            <br />
          </div>
          <h3>Tell your team why you uploaded {this.state.selectedFile.name}</h3>
          {/* Description input, with a 100 character limit. */}
          <Input
            maxLength={100}
            value={this.state.description}
            placeholder={`Made changes to ${this.state.selectedFile.name}`}
            onChange={e => {
              // Keep removing all whitespace to the left.
              this.setState({
                description: $.string(e.target.value).trimLeft()
              });
            }}
          />
          <p style={{ textAlign: "right", opacity: 0.65 }}>100 characters limit</p>
        </Modal>
      </div>
    );
  }
}
