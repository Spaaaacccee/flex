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
  static defaultProps = {
    contentType: undefined
  };
  state = {
    contentType: undefined
  };

  componentWillReceiveProps(props) {
    this.setState({ contentType: props.contentType, project: props.project });
  }

  render() {
    return (
      <div>
        {(this.state.contentType && this.state.project)?React.createElement(this.state.contentType, {
          project: this.state.project
        }):<Icon type="loading" style={{ fontSize: 24 }} spin />}
      </div>
    );
  }
}
