import React, { Component } from "react";
import propTypes from "prop-types";
import { Layout, Card, Icon, Avatar, Button } from "antd";
import Fire from "../classes/Fire";
import User from "../classes/User";
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
    contentType: undefined,
    project: {},
    user: {}
  };

  componentWillReceiveProps(props) {
    this.setState({ contentType: props.contentType });
    User.getCurrentUser().then(user => {
      if (user) this.setState({ user });
    });
    if (!props.project) return;
    if (
      this.state.project.projectID === props.project.projectID &&
      this.state.project.lastUpdatedTimestamp ===
        props.project.lastUpdatedTimestamp
    )
      return;
    this.setState({ project: props.project });
  }

  render() {
    return (
      <div>
        {this.state.contentType ? (
          <div>
            {React.createElement(this.state.contentType, {
              project: this.state.project,
              user: this.state.user
            })}
            <p style={{ marginTop: 20, opacity: 0.5 }}>
              Nothing else to show :)
            </p>
          </div>
        ) : (
          <Icon type="loading" style={{ fontSize: 24 }} spin />
        )}
      </div>
    );
  }
}
