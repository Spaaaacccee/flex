import React, { Component } from "react";
import { Layout, Card, Icon, Avatar, Button } from "antd";
import Fire from "../classes/Fire";
import User from "../classes/User";
import TopBar from "./TopBar";
import Project from "../classes/Project";
import "./PageView.css";
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
    loading: false,
    animation: false,
    scrollPosition:0
  };

  componentWillReceiveProps(props) {
    if (props.page !== this.state.page) {
      this.setState({ animation: false }, () => {
        this.setState({ page: props.page, animation: true });
      });
    }
    User.getCurrentUser().then(user => {
      if (user) this.setState({ user });
    });
    if (!props.project || Object.keys(props.project).length === 0) {
      this.setState({ loading: true });
      return;
    }
    this.setState({ loading: false });
    if (Project.equal(props.project, this.state.project)) return;
    this.setState({ project: props.project });
  }

  render() {
    const displayContent =
      !!this.state.page.content &&
      (!this.state.loading || this.state.page.requireProject === false);
    const firstTimeDisplayed = !this.contentDisplayed && displayContent;
    this.contentDisplayed = displayContent;
    return (
      <div
        ref={e => e?e.parentNode.onscroll=()=>{this.setState({scrollPosition:e.parentNode.scrollTop})}:false}
        style={{
          flex: 1,
          width: "100%",
          height: "100%"
        }}
      >
        <TopBar
          visibilityMode={this.state.page.topBarMode}
          scrollPosition={this.state.scrollPosition}
          style={{
            height: "52px",
            flex: "none"
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
          onMouseUp={this.props.onContentPress}
          onTouchStart={this.props.onContentPress}
        >
          {displayContent ? (
            <div className={this.state.animation ? "content-fade-in-up" : ""}>
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
                style={{ marginTop: "10vh", marginBottom: 50 }}
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
