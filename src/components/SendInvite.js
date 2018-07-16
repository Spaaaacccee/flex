import React, { Component } from "react";
import { Tabs, Input, Button, Modal, List } from "antd";
import UserSelector from "./UserSelector";
import User from "../classes/User";

/**
 * A component that can send invite to other users.
 * @export
 * @class SendInvite
 * @extends Component
 */
export default class SendInvite extends Component {
  state = {
    saveLoading: false,
    recipients: [],
    formInstance: 0,
    project: {},
  };
  componentWillReceiveProps(props) {
    if (this.state.visible !== !!props.visible) {
      this.setState({
        saveLoading: false,
        recipients:[],
        visible: !!props.visible
      });
    }
    this.setState({
      project: props.project,
    });
  }
  handleClose() {
    this.props.onClose();
  }

  handleSend() {
    this.setState({
      saveLoading: true,
      recipients:[],
      formInstance: this.state.formInstance + 1
    });
    Promise.all(
      this.state.recipients.map(async (item)=>(await User.get(item.key)).addInvite(this.state.project.projectID))
    ).then(()=>{
      this.props.onSend(this.state.values);
    });
    
  }
  handleUserSelectionChanged(values) {
    this.setState({
      recipients: values || []
    });
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
              disabled={!this.state.recipients.length}
            >
              {`Send ${this.state.recipients.length} Invite${
                this.state.recipients.length === 1 ? "" : "s"
              }`}
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
          <UserSelector
            key={this.state.formInstance}
            onValueChanged={this.handleUserSelectionChanged.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}
