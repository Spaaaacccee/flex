import React, { Component } from "react";
import { Tabs, Input, Button, Modal, List } from "antd";
import Project from "../classes/Project";

import { ObjectUtils } from "../classes/Utils";
import Role from "../classes/Role";
import RoleEditor from "./RoleEditor";
import formatJSON from "format-json-pretty";
import update from "immutability-helper";

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
    sourceProject: {},
    values: {
      general: { name: "", description: "" },
      roles: []
    },
    visible: false,
    saving: false
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    if (!this.state.visible && props.visible) {
      this.setState(
        {
          sourceProject: props.project,
          saving:false,
          visible: true
        },
        this.resetToMatchProject
      );
    } else {
      this.setState({ visible: props.visible });
    }
  }

  shouldComponentUpdate(props, state) {
    if (props.visible !== this.state.visible) return true;
    if (this.state.visible !== state.visible) return true;
    if (this.state.values !== state.values) return true;
    if(this.state.saving !== state.saving) return true;
    return false;
  }

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

  handleClose() {
    this.resetToMatchProject();
    this.props.onClose();
  }

  handleSave() {
    this.props.onSave(this.state.values);
    this.setState({ saving: true });
  }

  render() {
    return (
      <Modal
        style={{ top: 20 }}
        footer={[
          <Button
            key={0}
            icon="check"
            loading={this.state.saving}
            type="primary"
            onClick={this.handleSave.bind(this)}
          >
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
        <h2>Project Settings</h2>
        <Tabs defaultActiveKey="1">
          <TabPane tab="General" key="1">
            <h3>Project Name</h3>
            <Input
              value={this.state.values.general.name}
              onChange={e => {
                this.setState(
                  ObjectUtils.mergeDeep(this.state, {
                    values: { general: { name: e.target.value } }
                  })
                );
              }}
            />
            <br />
            <br />
            <h3>Project Description</h3>
            <Input.TextArea
              autosize={{ minRows: 2, maxRows: 6 }}
              value={this.state.values.general.description}
              onChange={e => {
                this.setState(
                  ObjectUtils.mergeDeep(this.state, {
                    values: { general: { description: e.target.value } }
                  })
                );
              }}
            />
            <br />
            <br />
          </TabPane>
          <TabPane tab="Roles" key="2">
            <RoleEditor
              values={this.state.values.roles}
              onChange={roles => {
                this.setState(
                  update(this.state, { values: { roles: { $set: roles } } })
                );
              }}
            />
          </TabPane>
          <TabPane tab="Security" key="3">
            Nothing is here yet
          </TabPane>
          <TabPane tab="Advanced" key="4">
            <Button>Transfer Ownership</Button>
            <br />
            <div style={{ height: 10 }} />
            <p>Make one of the members of this project the owner.</p>
            <br />
            <Button type="danger">Delete Project</Button>
            <br />
            <div style={{ height: 10 }} />
            <p>
              Permanently delete this project, including all files stored here.{" "}
              <b>This operation is not reversible.</b>
            </p>
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
