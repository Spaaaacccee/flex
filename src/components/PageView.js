import React, { Component } from "react";
import { Layout, Card, Icon, Avatar, Button } from "antd";
import Fire from "../classes/Fire";
import User from "../classes/User";
import TopBar from "./TopBar";
import { ObjectUtils } from "../classes/Utils";
const { Meta } = Card;

/**
 * Simply renders content from properties
 * @export PageView
 * @class PageView
 * @extends Component
 */
export default class PageView extends Component {
  static defaultProps = {
    page: {},
    onLeftButtonPress: () => {},
    onContentPress: () => {}
  };
  state = {
    page: {},
    project: {},
    user: {},
    loading: false
  };

  componentWillReceiveProps(props) {
    if (props.page !== this.state.page) {
      this.setState({ page: props.page });
      //props.contentType
    }
    User.getCurrentUser().then(user => {
      if (user) this.setState({ user });
    });
    if (!props.project || Object.keys(props.project).length === 0) {
      this.setState({ loading: true });
      return;
    }
    if (
      this.state.project.projectID === props.project.projectID &&
      this.state.project.lastUpdatedTimestamp ===
        props.project.lastUpdatedTimestamp
    )
      return;
    this.setState({ project: props.project, loading: false });
  }

  render() {
    return (
      <div>
        <TopBar
          style={{
            height: "56px",
            flex: 0
          }}
          onLeftButtonPress={this.props.onLeftButtonPress}
          onRightButtonPress={
            ((this.refs.pageContentElement || {}).onExtrasButtonPress
              ? (() => {
                  this.refs.pageContentElement.onExtrasButtonPress();
                }) || 0
              : 0) || (() => {})
          }
          leftButtonType={"menu"}
          rightButtonType={this.state.page.extrasButtonType}
          heading={this.state.page.name || "Untitled"}
        />
        <div
          style={{
            padding: "20px 10px"
          }}
          onMouseUp={this.props.onContentPress}
          onTouchStart={this.props.onContentPress}
        >
          {!!this.state.page.content && (!this.state.loading ||
          this.state.page.requireProject === false) ? (
            <div>
              {(() => {
                this.pageContentElement = React.createElement(
                  this.state.page.content,
                  {
                    project: this.state.project,
                    user: this.state.user,
                    ref: "pageContentElement",
                    passMessage: msg => {
                      this.props.onMessage(msg);
                    }
                  }
                );
                return this.pageContentElement;
              })()}
              {
                // <p style={{ marginTop: 20, opacity: 0.4 }}>
                //   <p>That's all there is</p>
                //   <Icon type="smile" />
                // </p>
              }
            </div>
          ) : (
            <Icon type="loading" style={{ fontSize: 24 }} spin />
          )}
        </div>
      </div>
    );
  }
}
