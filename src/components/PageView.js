import React, { Component } from "react";
import { Icon } from "antd";
import User from "../classes/User";
import TopBar from "./TopBar";
import Project from "../classes/Project";
import "./PageView.css";
import Page from "../classes/Page";
import $ from "../classes/Utils";

/**
 * Simply renders content from properties
 * @export PageView
 * @class PageView
 * @extends Component
 */
export default class PageView extends Component {

  static defaultProps = {
    onPageLoad: () => { },
    onMessage: () => { },
    page: {},
    onLeftButtonPress: () => { },
    onContentPress: () => { }
  };

  state = {
    page: {}, // The page that is displayed.
    project: {}, // The project that this page belongs to.
    user: {}, // The current user.
    loading: false, // Whether the page is loading.
    animation: false, // Whether the enter animation is playing.
    scrollPosition: 0 // The current vertical page scroll position.
  };

  /**
   * Whether it is currently loading.
   * @memberof PageView
   */
  loadingTimeout = false;

  /**
   * The ID of the current timeout.
   * @memberof PageView
   */
  currentTimeout = null;

  /**
   * Whether the current page is displayable.
   * @param  {Project} project 
   * @param  {Page} page 
   * @return 
   * @memberof PageView
   */
  isDisplayable(project, page) {
    return page && (!$.object(project).isUndefinedOrEmpty() || !page.requireProject);
  }

  requireRefresh(project, page) {
    return !Page.equal(page, this.state.page) || project.projectID !== this.state.project.projectID;
  }

  componentWillReceiveProps(props) {
    // If the current page cannot be displayed, show the loading icon.
    if (this.isDisplayable(props.project, props.page) && this.requireRefresh(props.project, props.page)) {
      this.setState({ animation: false, loading: true }, () => {
        setTimeout(() => {
          this.setState({ animation: true, loading: false, page: props.page, project: props.project }, () => {
            this.props.onPageLoad(this.state.page);
          });
        }, 0)
      })
    }

    // Get a fresh copy of user info if required.
    User.getCurrentUser().then(user => {
      if (user && !User.equal(user, this.state.user)) this.setState({ user });
    });
  }

  /**
   * A reference to the DOM element of the page.
   * @memberof PageView
   */
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
        {/* The top navgation bar */}
        <TopBar
          visibilityMode={this.state.page.topBarMode}
          scrollPosition={this.state.scrollPosition}
          style={{
            height: "52px",
            flex: "none"
          }}
          onLeftButtonPress={this.props.onLeftButtonPress}
          onRightButtonPress={() => {
            // When the top right button is pressed, execute the `onExtrasButtonPress` method on behalf of the page.
            ((this.pageContentElement || {}).onExtrasButtonPress || (() => { })).apply(this.pageContentElement);
          }}
          leftButtonType={"menu"}
          rightButtonType={this.state.page.extrasButtonType}
          heading={this.state.page.name || "Untitled"}
        />
        <div onClick={()=>{
          this.props.onContentPress()
        }}>
          {displayContent ? (
            // If the content shouold be displayed displayed the page.
            <div className={this.state.animation ? "content-fade-in-up" : ""}>
              {/* Dynamically create the page content. */}
              {React.createElement(this.state.page.content, {
                project: this.state.project,
                user: this.state.user,
                ref: e => (this.pageContentElement = e),
                passMessage: msg => {
                  this.props.onMessage(msg);
                },
                onLoad: page => {
                  this.props.onPageLoad(page);
                }
              })}
              {!(this.state.page || {}).hideFooter && (
                <p style={{ marginTop: 50 }}>
                  <img src="./icons/icon.png" style={{ width: 25, marginBottom: 50 }} />
                </p>
              )}
            </div>
          ) : (
              // Otherwise display a loading message.
              <div style={{ opacity: 0.65, margin: 50 }}>
                <Icon type="loading" style={{ marginTop: "10vh", marginBottom: 50 }} spin />
              </div>
            )}
        </div>
      </div>
    );
  }
}
