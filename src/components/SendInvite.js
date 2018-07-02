import React, { Component } from "react";
import { Tabs, Input, Button, Modal, List } from "antd";
import UserSelector from "./UserSelector";

export default class SendInvite extends Component {
  state = {
    saveLoading: false
  };
  componentWillReceiveProps(props) {
    if (this.state.visible !== !!props.visible) {
      this.setState({
        saveLoading: false
      });
    }
    this.setState({
      project: props.project,
      visible: !!props.visible
    });
  }
  handleClose() {
    this.props.onClose();
  }

  handleSend() {
    this.props.onSend(this.state.values);
    this.setState({ saveLoading: true });
  }
  render() {
    return (
      <div>
        <Modal
          footer={[
            <Button
              key={0}
              icon="check"
              loading={this.state.saveLoading}
              type="primary"
              onClick={this.handleSend.bind(this)}
            >
              Send Invite
            </Button>,
            <Button key={1} onClick={this.handleClose.bind(this)}>
              Cancel
            </Button>
          ]}
          visible={this.state.visible}
          width={800}
          maskClosable={false}
          onCancel={this.handleClose.bind(this)}
        >
          <h2>Invite Users</h2>
          <UserSelector/>
          <List
          size="large"
          dataSource={this.state.invites}
          renderItem={(item,index)=>(
              <List.Item key={index}>
                
              </List.Item>
          )}
          />
        </Modal>
      </div>
    );
  }
}
