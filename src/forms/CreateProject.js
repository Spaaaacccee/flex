import React, { Component } from "react";
import { Button, Input } from "antd";
import UserSelector from "../components/UserSelector";
import $ from "../classes/Utils";

/**
 * A form to create a project.
 * @export
 * @class CreateProject
 * @extends Component
 */
export default class CreateProject extends Component {
  state = {
    projectName: "", // The name of the project.
    description: "", // The description of the project.
    recipients: [], // The recipients that would receive a project invitation.
    submitted: false, // Whether this component is submitted.
    opened: false // Whether this component is opened.
  };
  handleSubmit() {
    // Show this component as submitted.
    this.setState({
      submitted: true
    });

    // Notify the parent component of this change.
    this.props.onSubmit(this.state);
  }

  componentWillReceiveProps(props) {
    if (!this.state.opened && !!props.opened) {
      // If the component has just opened, set submitted to false.
      this.setState({
        submitted: false
      });
    }
    // Set whether this form is opened.
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
