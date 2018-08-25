import React, { Component } from "react";
import { Button, Modal } from "antd";
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

  handleSend() {
    this.setState({
      saveLoading: true,
      recipients: []
    });
    Promise.all(
      this.state.recipients.map(async item => (await User.get(item.key)).addInvite(this.state.project.projectID))
    ).then(() => {
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
        {/* The invite users window */}
        <Modal
          destroyOnClose
          style={{ top: 20 }}
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
