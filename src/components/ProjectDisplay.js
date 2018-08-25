import React, { Component } from "react";
import { Card, Icon } from "antd";
import ProjectIcon from "./ProjectIcon";

/**
 * Display a project in a card.
 * @export
 * @class ProjectDisplay
 * @extends Component
 */
export default class ProjectDisplay extends Component {
  static defaultProps = {
    onOpenPressed: () => {}
  };
  state = {
    project: {}, // The project to display.
    style: {}, // Any style supplied.
    readOnly: false // Whether this component is read only.
  };
  componentWillReceiveProps(props) {
    // Update this component with new properties.
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
          loading={!(this.state.project || {}).name}
          actions={
            !this.state.readOnly
              ? [
                  // If the component is not read only, the display an option to open this project.
                  <span
                    onClick={() => {
                      this.props.onOpenPressed();
                    }}
                  >
                    <Icon type="export" />
                    {" Open"}
                  </span>
                ]
              : null
          }
          style={{
            ...{ width: 250, textAlign: "center", display: "inline-block" },
            ...this.state.style
          }}
        >
          {/* Display a project icon */}
          <ProjectIcon name={this.state.project.name} readOnly />
          <br />
          {/* Display the project name and description */}
          <Card.Meta title={this.state.project.name} description={this.state.project.description} />
        </Card>
      </div>
    );
  }
}
