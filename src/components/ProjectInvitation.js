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
    project: {}
  };



  componentWillReceiveProps(props) {
    this.setState({ project: props.project||this.state.project });
  }
  render() {
    return (
      <div>
        <Card
          style={{ width: 250, textAlign: "center", display: "inline-block" }}
          actions={[
            !this.state.project.deleted
              ? [
                  <span onClick={this.props.onAcceptInvite}>
                    <Icon type="check" />
                    {" Accept"}
                  </span>
                ]
              : [],
            ...[
              <Popconfirm
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
          <ProjectIcon
            name={!this.state.project.deleted ? this.state.project.name : "?"}
            readOnly
          />
          <br />
          <Card.Meta
            title={!this.state.project.deleted ? this.state.project.name : "Deleted"}
            description={
              !this.state.project.deleted
                ? this.state.project.description
                : "The owner has deleted this project."
            }
          />
        </Card>
      </div>
    );
  }
}
