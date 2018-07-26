import React, { Component } from "react";
import { Modal, Tabs } from "antd";
import FileUpload from "./FileUpload";

export default class FileUploadModal extends Component {
  state = {
    visible: false,
    project: {}
  };
  componentWillReceiveProps(props) {
    this.setState({ project: props.project, visible: props.visible });
  }
  render() {
    return (
      <Modal
        style={{ top: 20 }}
        visible={this.state.visible}
        onCancel={this.props.onClose}
      >
        <div>
          <h2>File Upload</h2>
          <Tabs>
            <Tabs.TabPane tab="Local Device" key="1">
              <FileUpload project={this.state.project} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="Google Drive" key="2" />
          </Tabs>
        </div>
      </Modal>
    );
  }
}
