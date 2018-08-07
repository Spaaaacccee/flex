import React, { Component } from "react";
import { Upload, Icon, message, Button, List, Progress } from "antd";
import update from "immutability-helper";
import Document, { UploadJob } from "../classes/Document";

export default class FileUpload extends Component {
  state = {
    project: {},
    jobs: [],
    jobListOnly: false,
    inProgressOnly: false
  };

  updateFiles() {
    this.setState({ jobs: UploadJob.Jobs.allJobs });
  }
  componentWillReceiveProps(props) {
    this.setState({
      project: props.project,
      jobListOnly: !!props.jobListOnly,
      inProgressOnly: !!props.inProgressOnly
    });
  }
  componentDidMount() {
    UploadJob.Jobs.on("job_changed", this.updateFiles.bind(this));
  }
  componentWillUnmount() {
    UploadJob.Jobs.off("job_changed", this.updateFiles.bind(this));
  }
  loadingMessage;
  render() {
    const renderJobs = this.state.jobs.filter(
      item => !this.state.inProgressOnly || item.status === "uploading"
    );
    return (
      <div>
        {!this.state.jobListOnly && (
          <div
            onClick={() => {
              if (this.loadingMessage) {
                this.loadingMessage();
                this.loadingMessage = null;
              }
              this.loadingMessage = message.loading("Waiting for file", 0);
            }}
          >
            <Upload.Dragger
              customRequest={({ file }) => {
                if (this.loadingMessage) {
                  this.loadingMessage();
                  this.loadingMessage = null;
                }
                this.state.project.addFile(file, this.updateFiles.bind(this));
              }}
              fileList={[]}
            >
              <p className="ant-upload-drag-icon">
                <Icon type="plus" />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
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
                    key={item.uid + index}
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
                            marginLeft: 0
                          }}
                          type="file"
                        />
                      }
                      title={item.name}
                      description={
                        <div>
                          <span style={{ textTransform: "capitalize" }}>
                            {item.status}
                          </span>
                          <span>
                            <Progress
                              percent={Math.min(Math.round(item.percent), 99)}
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
      </div>
    );
  }
}
