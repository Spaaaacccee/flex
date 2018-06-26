import React, { Component } from "react";
import { Form, Button, Input, Icon } from "antd";

export default class CreateProject extends Component {
  state = {
    projectName: "",
    submitted:false
  };
  handleSubmit() {
    this.setState({
      submitted:true
    });
    this.props.onSubmit(this.state);
  }
  render() {
    return (
      <div>
        <h1>Create a new project</h1>
        <p>Project name</p>
        <Input
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
        >
          Create
        </Button>
      </div>
    );
  }
}
