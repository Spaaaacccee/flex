import React, { Component } from "react";
import { Modal, Tabs, Button, List, Avatar, Progress } from "antd";
import FileUpload from "./FileUpload";
import GooglePicker from "react-google-picker";
import Fire from "../classes/Fire";
import update from "immutability-helper";

export default class FileUploadModal extends Component {
  state = {
    visible: false,
    project: {},
    drivePickedFiles: []
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({ project: props.project, visible: props.visible });
  }
  render() {
    return (
      <Modal
        style={{ top: 20 }}
        visible={this.state.visible}
        onCancel={this.props.onClose}
        onOk={this.props.onClose}
        footer={[
          <Button
            type="primary"
            key="0"
            onClick={this.props.onClose.bind(this)}
            icon="check"
          >
            Done
          </Button>
        ]}
      >
        <div>
          <h2>File</h2>
          <Tabs>
            <Tabs.TabPane tab="Local Device" key="1">
              <FileUpload project={this.state.project} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Google Drive" key="2">
              <div style={{ textAlign: "center", margin: 20 }}>
                <p>Link a Google Drive file to this project.</p>
                <GooglePicker
                  clientId={
                    "79879287257-rhkuuivs2g1rm3gc8r64rfq0ibumgo06.apps.googleusercontent.com"
                  }
                  developerKey={"AIzaSyDky75Lh8P3sqMCB3MvUVnRjwfquOcMerE"}
                  scope={["https://www.googleapis.com/auth/drive.readonly"]}
                  onChange={data => {
                    if (data.docs && data.docs[0]) {
                      this.state.project.addCloudFile(data.docs[0], () => {
                        this.setState(
                          update(this.state, {
                            drivePickedFiles: { $push: [data.docs[0]] }
                          })
                        );
                      });
                    }
                  }}
                  authImmediate={false}
                  viewId={"DOCS"}
                >
                  <Button icon="cloud-o">Pick a file</Button>
                </GooglePicker>
                {!!this.state.drivePickedFiles.length && (
                  <div>
                    <br />
                    <List bordered style={{ textAlign: "left" }}>
                      {this.state.drivePickedFiles.map((item, index) => (
                        <List.Item key={item.id}>
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                shape="square"
                                src={item.iconUrl}
                                style={{
                                  imageRendering: "pixelated",
                                  transform: "scale(0.6)"
                                }}
                              />
                            }
                            title={item.name}
                            description={
                              <div>
                                <span>Added</span>
                                <span>
                                  <Progress percent={100} status="success" />
                                </span>
                              </div>
                            }
                          />
                        </List.Item>
                      ))}
                    </List>
                  </div>
                )}
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Modal>
    );
  }
}
