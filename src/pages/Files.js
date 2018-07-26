import React, { Component } from "react";

import Fire from "../classes/Fire";

import { Card, Icon, Avatar, Button } from "antd";
import FileUpload from "../components/FileUpload";
import FileUploadModal from "../components/FileUploadModal";
import FileDisplay from "../components/FileDisplay";

const { Meta } = Card;

export default class FILES extends Component {
  static defaultProps = {
    project: {},
    user: {}
  };
  state = {
    project: {},
    user: {},
    uploadModalVisible: false
  };
  componentWillReceiveProps(props) {
    this.setState({ project: props.project, user: props.user });
  }
  onExtrasButtonPress() {
    this.setState({ uploadModalVisible: true });
  }
  render() {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ textAlign: "left", maxWidth: 500,margin:'auto' }}>
          <FileUpload project={this.state.project} jobListOnly inProgressOnly />
        </div>
        {(this.state.project.files || []).map((item, index) => (
          <div key={index} >
            <FileDisplay project={this.state.project} file={item}/>
          </div>
        ))}
        <Button
          icon="plus"
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
    );
  }
}
