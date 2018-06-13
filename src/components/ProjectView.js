import React, { Component } from "react";
import propTypes from "prop-types";
import { Layout, Icon } from "antd";
import TopBar from "./TopBar";
import ProjectSider from "./ProjectSider";
import PageView from "./PageView";
import { Pages } from "./Page";
import "./ProjectView.css";
const { Header, Footer, Sider, Content } = Layout;

export default class ProjectView extends Component {
  static propTypes = {
    projectID: propTypes.string,
    onNavButtonPress: propTypes.func,
    onContentPress: propTypes.func,
    onNavDrag: propTypes.func,
    navigationCollapsed: propTypes.bool,
    style: propTypes.any
  };

  static defaultProps = {
    projectID: "",
    onNavButtonPress: () => {},
    onContentPress: () => {},
    onNavDrag: () => {},
    navigationCollapsed: true,
    style: {}
  };

  state = {
    navigationCollapsed: true,
    siderWidth: 200,
    projectID: "",
    openedPage:Pages[0]
  };
  componentWillReceiveProps(props) {
    this.setState({
      navigationCollapsed: props.navigationCollapsed ? true : false,
      style: props.style || this.state.style,
      projectID: props.projectID || this.state.projectID
    });
  }

  render() {
    return (
      <div
          style={{
          flex: 1,
          height: "100%"
        }}
      >
        <Layout className="project-view-wrapper" style={this.state.style}>
          <Sider className="project-view-sider" width={this.state.siderWidth}>
            <div style={{
              position:'absolute',
              bottom:20,
              left:20,
              opacity:0.5
            }}
            >
              Project ID: {this.state.projectID || "Nothing"}
            </div>
            <ProjectSider
                items={Pages}
                onItemSelected={(itemSelectedEvent) => {
                this.setState({openedPage:itemSelectedEvent.item});
                this.props.onContentPress();
              }}
            />
          </Sider>
          <Layout
              className="project-view-content"
              style={{
              transform:
                "translateX(" +
                (this.state.navigationCollapsed
                  ? this.state.siderWidth * -1
                  : 0) +
                "px)"
            }}
          >
            <TopBar
                style={{
                height: "56px",
                flex: 0
              }}
                onLeftButtonPress={() => {
                this.props.onNavButtonPress();
              }}
                navButtonType="menu"
                heading={this.state.openedPage.name||"Untitled"}
            />
            <Content
                className="project-view-inner-content"
                onTouchStart={e => {
                this.props.onContentPress();

                //handle touch gesture
                var threshold = 70;
                var leftThreshold = 100;
                var timeLimit = 200;

                if (e.touches[0].clientX > leftThreshold) return;

                var initialTouch = e.touches[0].clientX;
                var fn = e => {
                  if (e.touches[0].clientX - initialTouch >= threshold) {
                    this.props.onNavDrag();
                    endFn();
                  }
                };

                var endFn = e => {
                  window.removeEventListener("touchmove", fn);
                  window.removeEventListener("touchend", endFn);
                };

                window.addEventListener("touchmove", fn);
                window.addEventListener("touchend", endFn);

                setTimeout(endFn, timeLimit);
              }}
                onMouseUp={() => {
                this.props.onContentPress();
              }}
            >
              <PageView content={<div>
                ProjectID: {this.state.projectID||"Nothing"}
                <br/>
                {this.state.openedPage.content}
                </div>
                ||
                <div/>}
              />
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}
