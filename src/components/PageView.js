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
    }
    User.getCurrentUser().then(user => {
      if (user) this.setState({ user });
    });
    if (!props.project || Object.keys(props.project).length === 0) {
      this.setState({ loading: true });
      return;
    }
    this.setState({ loading: false });
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
      <div style={{flex:1, display:'flex',flexDirection:'column', width:'100%'}}>
        <TopBar
          style={{
            height: "54px",
            flex: 'none'
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
            padding: "20px 10px",
            flex:1
          }}
          onMouseUp={this.props.onContentPress}
          onTouchStart={this.props.onContentPress}
        >
          {!!this.state.page.content &&
          (!this.state.loading || this.state.page.requireProject === false) ? (
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
            <div style={{ opacity: 0.65, margin: 50 }}>
              <Icon
                type="loading"
                style={{ marginTop: '10vh', marginBottom: 50 }}
                spin
              />
              <p>We're working really hard to load this content.</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
