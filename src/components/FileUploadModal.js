import React, { Component } from "react";
import { Modal, Tabs, Button, List, Avatar, Progress } from "antd";
import FileUpload from "./FileUpload";
import GooglePicker from "react-google-picker";
import Fire from "../classes/Fire";
import update from "immutability-helper";

/**
 * A window for uploading documents.
 * @export
 * @class FileUploadModal
 * @extends Component
 */
export default class FileUploadModal extends Component {
  static defaultProps = {
    onClose: () => {}
  };

  state = {
    visible: false, // Whether this window is visible.
    project: {}, // The project associated with this window.
    drivePickedFiles: [] // The files picked from Google Drive.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Update this component with new properties.
    this.setState({ project: props.project, visible: props.visible });
  }
  render() {
    return (
      <Modal
        destroyOnClose
        getContainer={() => document.querySelector(".modal-mount > div:first-child")}
        visible={this.state.visible}
        onCancel={this.props.onClose}
        onOk={this.props.onClose}
        footer={[
          // A close button, which passes a close message to the parent component.
          <Button type="primary" key="0" onClick={this.props.onClose.bind(this)} icon="check">
            Done
          </Button>
        ]}
      >
        <div>
          <h2>File</h2>
          <Tabs>
            <Tabs.TabPane tab="Local Device" key="1">
              {/* Local file upload component */}
              <FileUpload project={this.state.project} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Google Drive" key="2">
              <div style={{ textAlign: "center", margin: 20 }}>
                <p>Link a Google Drive file to this project.</p>
                 {/* Google Drive upload component */}
                <GooglePicker
                  clientId={"79879287257-rhkuuivs2g1rm3gc8r64rfq0ibumgo06.apps.googleusercontent.com"}
                  developerKey={"AIzaSyDky75Lh8P3sqMCB3MvUVnRjwfquOcMerE"}
                  scope={["https://www.googleapis.com/auth/drive.readonly"]}
                  onChange={data => {
                    // When a document is selected, add the file to the project.
                    if (data.docs && data.docs[0]) {
                      this.state.project.addCloudFile(data.docs[0], () => {
                        // Add the document to the list of uploaded documents of this component.
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
                  // If there are uploaded Google Drive files, display them here.
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
