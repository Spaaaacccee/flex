import React, { Component } from "react";
import { Tabs, Input, Button, Modal, Popconfirm, message, Icon } from "antd";
import RoleEditor from "./RoleEditor";
import formatJSON from "format-json-pretty";
import update from "immutability-helper";
import User from "../classes/User";
import $ from "../classes/Utils";

const { TabPane } = Tabs;

/**
 * Settings for a project
 * @export
 * @class Settings
 * @extends Component
 */
export default class Settings extends Component {
  static defaultProps = {
    onClose: () => {}
  };
  state = {
    sourceProject: {}, // The project to get default settings from.
    user: {}, // The current user.
    values: {
      general: { name: "", description: "" }, // Values from the settings.
      roles: [] // Roles from the settings.
    },
    visible: false, // Whether this window is visible.
    saving: false // Whether this window is currently saving.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Only update if the visibility state changed.
    if (!this.state.visible && props.visible) {
      this.setState(
        {
          sourceProject: props.project,
          saving: false,
          visible: true,
          user: props.user
        },
        this.resetToMatchProject
      );
    } else {
      // Otherwise close the window.
      this.setState({ visible: props.visible });
    }
  }

  shouldComponentUpdate(props, state) {
    if (props.visible !== this.state.visible) return true;
    if (this.state.visible !== state.visible) return true;
    if (this.state.values !== state.values) return true;
    if (this.state.saving !== state.saving) return true;
    // Don't update if nothing has changed.
    return false;
  }

  /**
   * Reset the fields of this settings component to match the source project.
   * @return {void}
   * @memberof Settings
   */
  resetToMatchProject() {
    this.setState({
      values: {
        general: {
          name: this.state.sourceProject.name,
          description: this.state.sourceProject.description
        },
        roles: this.state.sourceProject.roles || []
      }
    });
  }

  /**
   * What to do when the close button is pressed.
   * @return {void}
   * @memberof Settings
   */
  handleClose() {
    this.resetToMatchProject();
    // Inform the parent component of this change.
    this.props.onClose();
  }

  /**
   * What to do when the save button is pressed.
   * @return {void}
   * @memberof Settings
   */
  handleSave() {
    // Ask the parent component to save the settings.
    this.props.onSave(this.state.values);
    // Start a save animation.
    this.setState({ saving: true });
  }

  render() {
    return (
      // The settings window.
      <Modal
        destroyOnClose
        getContainer={() => document.querySelector(".modal-mount > div:first-child")}
        style={{ top: 20 }}
        footer={[
          <Button key={0} icon="check" loading={this.state.saving} type="primary" onClick={this.handleSave.bind(this)}>
            Save Settings
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
        {/* General Project settings */}
        <h2>Project Settings</h2>
        <Tabs defaultActiveKey="1">
          <TabPane
            tab={
              <span>
                <Icon type="setting" />
                {"General"}
              </span>
            }
            key="1"
          >
            <h3>Project Name</h3>
            {/* Project name input */}
            <Input
              maxLength={100}
              onBlur={e => {
                this.setState(
                  // When this input loses focus, change this field so it's valid
                  update(this.state, {
                    values: {
                      general: {
                        name: {
                          $set: e.target.value.trim() || "Untitled Project"
                        }
                      }
                    }
                  })
                );
              }}
              value={this.state.values.general.name}
              onChange={e => {
                this.setState(
                  // Keep trimming the left side of this field to remove spaces on the left side.
                  update(this.state, {
                    values: {
                      general: {
                        name: { $set: $.string(e.target.value).trimLeft() }
                      }
                    }
                  })
                );
              }}
            />
            <p style={{ textAlign: "right", opacity: 0.65 }}>100 characters limit</p>
            <h3>Project Description</h3>
            {/* Project description field */}
            <Input.TextArea
              maxLength={2000}
              autosize={{ minRows: 2, maxRows: 6 }}
              value={this.state.values.general.description}
              onChange={e => {
                this.setState(
                  update(this.state, {
                    values: {
                      general: { description: { $set: e.target.value } }
                    }
                  })
                );
              }}
            />
            <p style={{ textAlign: "right", opacity: 0.65 }}>2000 characters limit</p>
          </TabPane>
          <TabPane
            tab={
              <span>
                <Icon type="tags-o" />
                {"Roles"}
              </span>
            }
            key="2"
          >
            <RoleEditor
              values={this.state.values.roles}
              onChange={roles => {
                // Reflect the changes done in the role editor in the project settings.
                this.setState(update(this.state, { values: { roles: { $set: roles } } }));
              }}
            />
          </TabPane>
          <TabPane
            tab={
              <span>
                <Icon type="warning" />
                {"Advanced"}
              </span>
            }
            key="3"
          >
            {/* Transfer ownership button. May be present in future versions. */}
            <Button disabled>Transfer Ownership</Button>
            <br />
            <div style={{ height: 10 }} />
            <p>Make one of the members of this project the owner.</p>
            <br />
            {this.state.user.uid === this.state.sourceProject.owner ? (
              <div>
                <Popconfirm
                  title="Delete this project?"
                  okText="Yes"
                  okType="danger"
                  cancelText="No"
                  onConfirm={() => {
                    // What to do when deleting a project.
                    this.setState({ saving: true }, async () => {
                      // Make every member leave the project.
                      await Promise.all(
                        (this.state.sourceProject.members || []).map(async member =>
                          (await User.get(member.uid)).leaveProject(this.state.sourceProject.projectID, true)
                        )
                      );
                      // Delete all files
                      await Promise.all(
                        (this.state.sourceProject.files || []).map(async file => this.state.sourceProject.tryDelete(file))
                      );
                      // Delete the project
                      let error = await this.state.user.deleteProject(this.state.sourceProject.projectID);
                      // If no errors occured, then display a message, and notify the parent component.
                      if (!error) {
                        message.success(`Successfully deleted ${this.state.sourceProject.name}`);
                      }
                      this.props.onClose();
                    });
                  }}
                >
                  <Button type="danger" disabled={this.state.saving}>
                    Delete Project
                  </Button>
                </Popconfirm>
                <br />
                <div style={{ height: 10 }} />
                <p>
                  Permanently delete this project, including all files stored here. <b>This operation is not reversible.</b>
                </p>
              </div>
            ) : (
              <div>
                <Button
                  type="danger"
                  disabled={this.state.saving}
                  onClick={() => {
                    this.setState({ saving: true }, () => {
                      // What to do when leaving a project.
                      User.getCurrentUser().then(user => {
                        // Make the current user leave the project.
                        user.leaveProject(this.state.sourceProject.projectID).then(error => {
                          if (!error) {
                            // If no error occured then display a message.
                            message.success(`Successfully left ${this.state.sourceProject.name}`);
                          }
                          this.props.onClose();
                        });
                      });
                    });
                  }}
                >
                  Leave Project
                </Button>
                <br />
                <div style={{ height: 10 }} />
                <p>You won't be able to rejoin until someone invites you again.</p>
              </div>
            )}
          </TabPane>
          <TabPane tab="Debug" key="5">
            <pre>{formatJSON(this.state.sourceProject)}</pre>
          </TabPane>
        </Tabs>
        <br />
      </Modal>
    );
  }
}
