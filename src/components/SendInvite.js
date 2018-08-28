import React, { Component } from "react";
import { Button, Modal, message } from "antd";
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
    saveLoading: false, // Whether the invite is currently trying to send.
    recipients: [], // The recipients of the invite.
    project: {}
  };
  componentWillReceiveProps(props) {
    // If the visibility state changed, then update this component.
    if (this.state.visible !== !!props.visible) {
      this.setState({
        saveLoading: false,
        recipients: [],
        visible: !!props.visible
      });
    }
    // Update this project.
    this.setState({
      project: props.project
    });
  }

  async handleSend() {
    this.setState({
      saveLoading: true,
      recipients: []
    });
    // Grant all selected users permission to use the project.
    await Promise.all(
      this.state.recipients.map(async item => {
        // Grant permission if they do not already have permission.
        if (!(this.state.project.permissions || {})[item.key]) {
          await this.state.project.setPermission(item.key, true);
          message.info(`We gave permission to ${(await User.get(item.key)).name} to make changes. `);
        }
      })
    );
    // Invite all selected users.
    await Promise.all(
      this.state.recipients.map(async item => (await User.get(item.key)).addInvite(this.state.project.projectID))
    );
    this.props.onSend(this.state.values);
  }

  handleUserSelectionChanged(values) {
    this.setState({
      recipients: values || []
    });
  }

  render() {
    return (
      <div>
        {/* The invite users window */}
        <Modal
          destroyOnClose
          getContainer={() => document.querySelector(".modal-mount > div:first-child")}
          footer={[
            <Button
              key={0}
              icon="check"
              loading={this.state.saveLoading}
              type="primary"
              onClick={this.handleSend.bind(this)}
              disabled={!this.state.recipients.length}
            >
              {/* Display the currently selected user count on the send button. */}
              {`Send ${this.state.recipients.length} Invite${this.state.recipients.length === 1 ? "" : "s"}`}
            </Button>,
            <Button
              key={1}
              onClick={() => {
                this.props.onClose();
              }}
            >
              Cancel
            </Button>
          ]}
          visible={this.state.visible}
          width={800}
          maskClosable={false}
          onCancel={() => {
            this.props.onClose();
          }}
        >
          <h2>Invite Users</h2>
          <p>Give people access to this project so they too can contribute alongside you.</p>
          <h3>People to invite</h3>
          {/* The user selector */}
          <UserSelector onValueChanged={this.handleUserSelectionChanged.bind(this)} />
        </Modal>
      </div>
    );
  }
}
