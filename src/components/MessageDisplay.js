import React, { Component } from "react";

class MessageDisplay extends Component {
  state = { message: { content: {} } };
  componentWillReceiveProps(props) {
    this.setState({ message: props.message });
  }
  render() {
    return <div></div>;
  }
}

export default MessageDisplay;
