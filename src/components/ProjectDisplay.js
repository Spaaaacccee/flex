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
  static defaultProps = {
    onOpenPressed: () => {}
  };
  state = {
    project: {},
    style: {},
    readOnly: false
  };
  componentWillReceiveProps(props) {
    this.setState({
      project: props.project || this.state.project,
      style: props.style || {},
      readOnly: !!props.readOnly
    });
  }
  render() {
    return (
      <div>
        <Card
          actions={!this.state.readOnly?[
            <span
              onClick={() => {
                this.props.onOpenPressed();
              }}
            >
              <Icon type="export" />
              {" Open"}
            </span>
          ]:null}
          style={Object.assign(
            { width: 250, textAlign: "center", display: "inline-block" },
            this.state.style
          )}
        >
          <ProjectIcon
            name={this.state.project.name}
            readOnly
          />
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
