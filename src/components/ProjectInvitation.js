import React, { Component } from "react";
import { Card, Icon, Popconfirm } from "antd";
import ProjectIcon from "./ProjectIcon";

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
          style={{ maxWidth: 300, textAlign:'center' }}
          actions={[
            <Icon type="check" onClick={this.props.onAcceptInvite} />,
            <Popconfirm
              title="Are you sure you want to reject this invite?"
              okText="Yes"
              cancelText="No"
              onConfirm={this.props.onRejectInvite}
            >
              <Icon type="close" />
            </Popconfirm>,
            <Icon type="ellipsis" />
          ]}
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
