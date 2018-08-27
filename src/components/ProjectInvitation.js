import React, { Component } from "react";
import { Card, Icon, Popconfirm } from "antd";
import ProjectIcon from "./ProjectIcon";

/**
 * Displays an invitation in a card
 * @export
 * @class ProjectInvitation
 * @extends Component
 */
export default class ProjectInvitation extends Component {
  static defaultProps = {
    onAcceptInvite: () => {},
    onRejectInvite: () => {},
    project: {}
  };

  state = {
    project: {} // The project the invitation is from.
  };

  componentWillReceiveProps(props) {
    // Update this component with new properties.
    this.setState({ project: props.project || this.state.project });
  }

  render() {
    return (
      <div>
        <Card
          style={{ width: 250, textAlign: "center", display: "inline-block" }}
          actions={[
            // If the project was not deleted, then display an accept button.
            !this.state.project.deleted
              ? [
                  <span onClick={this.props.onAcceptInvite} key={0}>
                    <Icon type="check" />
                    {" Accept"}
                  </span>
                ]
              : [],
            ...[
              <Popconfirm
                key={1}
                title="Are you sure you want to reject this invite?"
                okText="Yes"
                cancelText="No"
                onConfirm={this.props.onRejectInvite}
              >
                <span>
                  <Icon type="close" />
                  {" Reject"}
                </span>
              </Popconfirm>
            ]
          ]}
        >
          {/* Display a project icon. If the project was deleted, then only display a question mark. */}
          <ProjectIcon name={!this.state.project.deleted ? this.state.project.name : "?"} readOnly />
          <br />
          {/* Display the name and description of the project */}
          <Card.Meta
            title={!this.state.project.deleted ? (this.state.project.name || "").substring(0, 15) : "Deleted"}
            description={
              !this.state.project.deleted
                ? (this.state.project.description || "").substring(0, 30)
                : "The owner has deleted this project."
            }
          />
        </Card>
      </div>
    );
  }
}
