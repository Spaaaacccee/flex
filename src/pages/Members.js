import React, { Component } from "react";
import { Tabs } from "antd";

export default class Page_Members extends Component {
  static defaultProps = {
    project:undefined,
  }
  componentWillReceiveProps(props) {
      this.setState(props);
  }
  render() {
    return <div></div>;
  }
}
