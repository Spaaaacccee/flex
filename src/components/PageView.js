import React, { Component } from "react";
import { Layout, Card, Icon, Avatar, Button } from "antd";
import Fire from "../classes/Fire";
import User from "../classes/User";
import TopBar from "./TopBar";
import Project from "../classes/Project";
import "./PageView.css";
import Page from "../classes/Page";
const { Meta } = Card;

/**
 * Simply renders content from properties
 * @export PageView
 * @class PageView
 * @extends Component
 */
export default class PageView extends Component {
  static defaultProps = {
    onLoad: () => {},
    onMessage: () => {},
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
    scrollPosition: 0
  };

  shouldComponentUpdate(props, state) {
    if (props.page !== this.state.page) return true;
    if (!Project.equal(props.project, this.state.project)) return true;
    if (!User.equal(state.user, this.state.user)) return true;
    if (!state.scrollPostion && this.state.scrollPosition) return true;
    if (state.scrollPostion && !this.state.scrollPosition) return true;
    if (this.state.animation !== state.animation) return true;
    if (this.state.loading !== state.loading) return true;
    return false;
  }
  loadingTimeout = false;
  currentTimeout = null;

  isDisplayable(project, page) {
    return Object.keys(project || {}).length || !page.requireProject;
  }

  componentWillReceiveProps(props) {
    if (!this.isDisplayable(props.project, props.page)) {
      this.setState({ animation: false, loading: true });
    }
    this.setState({ project: props.project });
    // If the page or the project was switched.
    if (
      !Page.equal(props.page, this.state.page) ||
      (props.project.projectID !== this.state.project.projectID && props.project.projectID)
    ) {
      this.loadingTimeout = true;
      if (this.currentTimeout) {
        clearTimeout(this.currentTimeout);
        this.currentTimeout = null;
      }
      this.setState(
        {
          animation: false,
          loading: true,
          page: props.page
        },
        () => {
          this.currentTimeout = setTimeout(() => {
            this.loadingTimeout = false;
            if (this.isDisplayable(this.state.project, this.state.page)) {
              this.setState({ animation: true, loading: false });
            }
          }, 400);
        }
      );
    }
    User.getCurrentUser().then(user => {
      if (user && !User.equal(user, this.state.user)) this.setState({ user });
    });
  }
  pageContentElement;
  render() {
    const displayContent = !!this.state.page.content && !this.state.loading;
    return (
      <div
        className="page-view-wrapper"
        ref={e =>
          e
            ? (e.parentNode.onscroll = () => {
                this.setState({ scrollPosition: e.parentNode.scrollTop });
              })
            : false
        }
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
          onRightButtonPress={() => {
            ((this.pageContentElement || {}).onExtrasButtonPress || (() => {})).apply(this.pageContentElement);
          }}
          leftButtonType={"menu"}
          rightButtonType={this.state.page.extrasButtonType}
          heading={this.state.page.name || "Untitled"}
        />
        <div onMouseUp={this.props.onContentPress} onTouchStart={this.props.onContentPress}>
          {displayContent ? (
            <div className={this.state.animation ? "content-fade-in-up" : ""}>
              {React.createElement(this.state.page.content, {
                project: this.state.project,
                user: this.state.user,
                ref: e => (this.pageContentElement = e),
                passMessage: msg => {
                  this.props.onMessage(msg);
                },
                onLoad: page => {
                  this.props.onLoad(page);
                }
              })}
              {!(this.state.page || {}).hideFooter && (
                <p style={{ marginTop: 50 }}>
                  <img src="./icons/icon.png" style={{ width: 25, marginBottom: 50 }} />
                </p>
              )}
            </div>
          ) : (
            <div style={{ opacity: 0.65, margin: 50 }}>
              <Icon type="loading" style={{ marginTop: "10vh", marginBottom: 50 }} spin />
              <p>We're working really hard to load this content.</p>
            </div>
          )}
        </div>
      </div>
    );
  }
}
