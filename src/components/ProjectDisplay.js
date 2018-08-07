import React, { Component } from "react";
import { Card, Icon, Popconfirm } from "antd";
import ProjectIcon from "./ProjectIcon";

/**
 * Displays an invitation in a card
 * @export
 * @class ProjectInvitation
 * @extends Component
 */
export default class ProjectDisplay extends Component {
  state = {
    project: {}
  };
  componentWillReceiveProps(props) {
    this.setState({ project: props.project||this.state.project });
  }
  render() {
    return (
      <div>
        <Card
          style={{ width: 250, textAlign:'center', display:'inline-block' }}
        >
          <ProjectIcon name={this.state.project.name} />
          <br />
          <Card.Meta
            title={this.state.project.name}
            description={this.state.project.description}
          />
        </Card>
      </div>
    );
  }
}
