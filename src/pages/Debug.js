import React, { Component } from "react";
import { Tabs, Card } from "antd";

export default class Page_Debug extends Component {
  static defaultProps = {
    project: undefined
  };
  componentWillReceiveProps(props) {
    this.setState(props);
  }
  render() {
    return (
      <div>
        <Card style={{textAlign:'left'}}>
          <div>{JSON.stringify(this.props.project)}</div>
        </Card>
      </div>
    );
  }
}
