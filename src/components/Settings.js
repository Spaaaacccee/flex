import React, { Component } from "react";
import { Tabs, Input, Button, Modal } from "antd";
import Project from "../classes/Project";
import propTypes from "prop-types";
import { ObjectUtils } from "../classes/Utils";
const { TabPane } = Tabs;

export default class Settings extends Component {
  static propTypes = {
    sourceProject: propTypes.instanceOf(Project)
  };
  static defaultProps = {
    onClose: () => {}
  };
  state = {
    sourceProject: undefined,
    values: { general: { name: "", description: "" } },
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
    if (props.project && props.project !== this.state.sourceProject) {
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
        }
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
        footer={null}
        visible={this.state.visible}
        width={1024}
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
            Content of tab 2
          </TabPane>
          <TabPane tab="Security" key="3">
            Content of tab 3
          </TabPane>
          <TabPane tab="Advanced" key="4">
            Content of tab 4
          </TabPane>
        </Tabs>
        <br />
        <Button
          icon="check"
          loading={this.state.saveLoading}
          type="primary"
          onClick={this.handleSave.bind(this)}
        >
          Save Settings
        </Button>
        <span style={{ width: 10, display: "inline-block" }} />
        <Button onClick={this.handleClose.bind(this)}>Cancel</Button>
      </Modal>
    );
  }
}
