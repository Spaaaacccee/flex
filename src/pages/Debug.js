import React, { Component } from "react";
import { Card } from "antd";

/**
 * Display debug info for a project.
 * Currently not under use.
 * @export
 * @class DEBUG
 * @extends Component
 */
export default class DEBUG extends Component {
  static defaultProps = {
    project: undefined
  };
  componentWillReceiveProps(props) {
    this.setState(props);
  }
  render() {
    return (
      <div>
        <Card style={{ textAlign: "left" }}>
          <div>{JSON.stringify(this.props.project)}</div>
        </Card>
      </div>
    );
  }
}
