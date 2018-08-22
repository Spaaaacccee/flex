import React, { Component } from "react";
import { Form, Button, Input, Icon } from "antd";
import UserSelector from "../components/UserSelector";
import $ from "../classes/Utils";

export default class CreateProject extends Component {
  state = {
    projectName: "",
    description: "",
    recipients: [],
    submitted: false,
    opened: false
  };
  handleSubmit() {
    this.setState({
      submitted: true
    });
    this.props.onSubmit(this.state);
  }

  componentWillReceiveProps(props) {
    if (!this.state.opened && !!props.opened) {
      this.setState({
        submitted: false
      });
    }
    this.setState({ opened: props.opened });
  }

  render() {
    return (
      <div>
        <h2>New Project</h2>
        <h3>Project name</h3>
        <Input
          maxLength={100}
          onBlur={e => {
            this.setState({
              projectName: e.target.value.trim()
            });
          }}
          placeholder="Untitled Project"
          onChange={e => {
            this.setState({
              projectName: $.string(e.target.value).trimLeft()
            });
          }}
        />
        <p style={{ textAlign: "right", opacity: 0.65 }}>
          100 characters limit
        </p>
        <h3>Project description</h3>
        <Input.TextArea
          maxLength={2000}
          onChange={e => {
            this.setState({
              description: e.target.value
            });
          }}
        />
        <p style={{ textAlign: "right", opacity: 0.65 }}>
          2000 characters limit
        </p>
        <h3>Invite some people and get things started</h3>
        <UserSelector
          onValueChanged={values => {
            this.setState({ recipients: values });
          }}
        />
        <br />
        <br />
        <div style={{ textAlign: "right" }}>
          <Button
            type="primary"
            onClick={this.handleSubmit.bind(this)}
            loading={this.state.submitted}
            icon="check"
          >
            Create
          </Button>
        </div>
      </div>
    );
  }
}
