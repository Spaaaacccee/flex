import React, { Component } from "react";
import { Tabs, Input, Button, Modal, List } from "antd";
import Project from "../classes/Project";
import propTypes from "prop-types";
import { ObjectUtils } from "../classes/Utils";
import Role from "../classes/Role";
import RoleEditor from "./RoleEditor";
const { TabPane } = Tabs;

/**
 * Settings for a project
 * @export
 * @class Settings
 * @extends Component
 */
export default class Settings extends Component {
  static propTypes = {
    sourceProject: propTypes.instanceOf(Project)
  };
  static defaultProps = {
    onClose: () => {}
  };
  state = {
    sourceProject: {},
    values: {
      general: { name: "", description: "" },
      roles: []
    },
    visible: false
  };

  componentWillReceiveProps(props) {
    if (this.state.visible !== !!props.visible) {
      this.setState({
        saveLoading: false
      });
    }
    this.setState({
      visible: !!props.visible
    });
    if (
      (!this.state.sourceProject && props.project) ||
      (props.project &&
        props.project.lastUpdatedTimestamp !==
          this.state.sourceProject.lastUpdatedTimestamp &&
        props.project.projectID !== this.state.sourceProject.projectID)
    ) {
      this.setState(
        {
          sourceProject: props.project
        },
        this.resetToMatchProject
      );
    }
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
    this.setState({ saveLoading: true });
  }

  render() {
    return (
      <Modal
        style={{ top: 20 }}
        footer={[
          <Button
            key={0}
            icon="check"
            loading={this.state.saveLoading}
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
            <p>Project Name</p>
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
            <p>Project Description</p>
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
              values={this.state.values}
              onChange={newValues => {
                console.log(newValues);
                this.setState({ values: newValues });
              }}
            />
          </TabPane>
          <TabPane tab="Security" key="3">
            Nothing is here yet
          </TabPane>
          <TabPane tab="Advanced" key="4">
            <Button>Transfer Ownership</Button>
            <br /><div style={{height:10}} />
            <p>Make one of the members of this project the owner.</p>
            <br />
            <Button type="danger">Delete Project</Button>
            <br /><div style={{height:10}} />
            <p>
              Permanently delete this project, including all files stored here.{" "}
              <b>This operation is not reversible.</b>
            </p>
          </TabPane>
        </Tabs>
        <br />
      </Modal>
    );
  }
}
