import React, { Component } from "react";
import { Upload, Icon, message, Button, List, Progress } from "antd";
import update from "immutability-helper";
import Document, { UploadJob } from "../classes/Document";
import { IDGen } from "../classes/Utils";

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
  render() {
    const renderJobs = this.state.jobs.filter(
      item => !this.state.inProgressOnly || item.status === "uploading"
    );
    return (
      <div>
        {!this.state.jobListOnly && (
          <Upload.Dragger
            customRequest={({ file }) => {
              this.state.project.addFile(file).then(() => {
                this.updateFiles();
              });
            }}
            onChange={info => {
              console.log(info);
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
        )}
        <div>
          <br />
          {!!renderJobs.length && (
            <div>
              <List bordered>
                {renderJobs.map((item, index) => (
                  <List.Item key={index}>
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
                              percent={Math.round(item.percent)}
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
