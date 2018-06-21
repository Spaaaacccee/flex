import React, { Component } from "react";
import propTypes from "prop-types";
import { Layout, Card, Icon, Avatar, Button } from "antd";
import Fire from "../classes/Fire";
const { Meta } = Card;

/**
 * Simply renders content from properties
 * @export PageView
 * @class PageView
 * @extends Component
 */
export default class PageView extends Component {
  static propTypes = {
    content: propTypes.node
  };
  static defaultProps = {
    content: <div />
  };
  state = {
    content: <div />
  };

  componentWillReceiveProps(props) {
    this.setState({ content: props.content });
  }

  render() {
    return <div>{this.state.content}</div>;
  }
}
