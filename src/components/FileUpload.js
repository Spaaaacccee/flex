import React, { Component } from "react";
import { Upload, Icon, message, Button, List, Progress, Modal, Input } from "antd";
import update from "immutability-helper";
import Document, { UploadJob } from "../classes/Document";
import $ from "../classes/Utils";

export default class FileUpload extends Component {
  state = {
    project: {},
    jobs: [],
    jobListOnly: false,
    inProgressOnly: false,
    selectedFile: {},
    modalVisible: false,
    description: "",
    loading: false,
    specifyFileName: null
  };

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
    UploadJob.Jobs.on("job_changed", this.updateFiles.bind(this));
    this.componentWillReceiveProps(this.props);
    this.updateFiles();
  }
  componentWillUnmount() {
    UploadJob.Jobs.off("job_changed", this.updateFiles.bind(this));
  }
  render() {
    const renderJobs = this.state.jobs.filter(item => !this.state.inProgressOnly || item.status === "uploading");
    return (
      <div>
        {!this.state.jobListOnly && (
          <div>
            <Upload.Dragger
              customRequest={({ file }) => {
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
                if (file.size > 1024 * 1024 * 50) {
                  message.error(`${file.name} is larger than the maximum allowed file size (50 MB).`);
                  return;
                }
                this.setState({
                  selectedFile: file,
                  modalVisible: true,
                  loading: false
                });
              }}
              fileList={[]}
            >
              <p className="ant-upload-drag-icon">
                <Icon type="plus" />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
            </Upload.Dragger>
          </div>
        )}
        <div>
          {!!renderJobs.length && (
            <div>
              <br />
              <List bordered>
                {renderJobs.map((item, index) => (
                  <List.Item
                    key={item.uid}
                    actions={
                      item.status === "done" || item.status === "canceled"
                        ? null
                        : [
                            <Icon
                              type="close"
                              onClick={() => {
                                item.cancelJob();
                                this.updateFiles();
                              }}
                            />
                          ]
                    }
                  >
                    <List.Item.Meta
                      avatar={
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
                        <div>
                          <span style={{ textTransform: "capitalize" }}>{item.status}</span>
                          <span>
                            <Progress
                              percent={item.status === "done" || item.status === "error" ? 100 : Math.min(Math.round(item.percent), 99)}
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
        <Modal
          getContainer={()=>document.querySelector(".modal-mount > div:first-child")}
          style={{ top: 40 }}
          visible={this.state.modalVisible}
          onCancel={() => {
            this.setState({
              selectedFile: {},
              modalVisible: false,
              description: ""
            });
          }}
          footer={[
            <Button
              icon="check"
              loading={this.state.loading}
              type="primary"
              onClick={() => {
                this.setState({ loading: true }, () => {
                  this.state.project.addFile(
                    this.state.selectedFile,
                    this.state.description.trim() || `Made changes to ${this.state.selectedFile.name}`,
                    () => {
                      this.setState({
                        selectedFile: {},
                        modalVisible: false,
                        description: ""
                      });
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
          <Input
            maxLength={100}
            value={this.state.description}
            placeholder={`Made changes to ${this.state.selectedFile.name}`}
            onChange={e => {
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
