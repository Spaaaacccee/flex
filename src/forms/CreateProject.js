import React, { Component } from "react";
import { Form, Button, Input, Icon } from "antd";

export default class CreateProject extends Component {
  state = {
    projectName: "",
    submitted: false,
    opened:false
  };
  handleSubmit() {
    this.setState({
      submitted: true
    });
    this.props.onSubmit(this.state);
  }

  componentWillReceiveProps(props) {
    if(!this.state.opened && !!props.opened) {
      this.setState({
        submitted: false,
      });
    }

  }

  render() {
    return (
      <div>
        <h2>Create a new project</h2>
        <Input
          addonBefore="Project name"
          placeholder="Untitled Project"
          onChange={e => {
            this.setState({
              projectName: e.target.value
            });
          }}
        />
        <br />
        <br />
        <Button
          type="primary"
          onClick={this.handleSubmit.bind(this)}
          loading={this.state.submitted}
          icon="check" 
        >
          Create
        </Button>
      </div>
    );
  }
}
