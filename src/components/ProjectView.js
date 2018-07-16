import React, { Component } from "react";
import propTypes from "prop-types";
import { Layout, Icon, Modal, message } from "antd";
import TopBar from "./TopBar";
import ProjectSider from "./ProjectSider";
import PageView from "./PageView";
import { Pages, UserPage } from "../classes/Page";
import Fetch from "../classes/Fetch";
import Project from "../classes/Project";

import "./ProjectView.css";
import Settings from "./Settings";
import SendInvite from "./SendInvite";

const { Header, Footer, Sider, Content } = Layout;

export default class ProjectView extends Component {
  static propTypes = {
    projectID: propTypes.string,
    siderWidth: propTypes.number,
    onNavButtonPress: propTypes.func,
    onContentPress: propTypes.func,
    onNavDrag: propTypes.func,
    navigationCollapsed: propTypes.bool,
    style: propTypes.any
  };

  static defaultProps = {
    projectID: "", // The project ID of the project that should be displayed
    siderWidth: 200,
    onNavButtonPress: () => {}, // A callback for when the expand/collapse navigation button is pressed
    onContentPress: () => {}, // A callback for when the main content area is pressed
    onNavDrag: () => {}, // A callback for when an open navigation gesture is performed
    navigationCollapsed: true, // Whether or not the in-project navigation bar should be collapsed
    style: {} // Pass the style attribute from the Component to the DOM element
  };

  state = {
    navigationCollapsed: true,
    projectID: "",
    openedPage: Pages[0],
    hideSideBar: false,
    style: {},
    project: {},
    settingsVisible: false,
    inviteUsersVisible: false,
    pauseSiderUpdate:false
  };
  componentWillReceiveProps(props) {
    this.setState({
      pauseSiderUpdate:props.pauseSiderUpdate,
      navigationCollapsed: props.navigationCollapsed ? true : false,
      style: props.style || this.state.style,
      projectID: props.projectID,
      hideSideBar: !!props.hideSideBar, // By inverting the value of hideSideBar twice, the value is guaranteed to be a boolean
      siderWidth: props.siderWidth
    });
    // If no project ID is supplied, switch to user page
    if (!props.projectID) {
      this.setState({
        openedPage: UserPage[0]
      });
    } else {
      // If the project ID from props is different to the projectID from state, that means navigation has occured, reset the project view.
      if(props.projectID !== this.state.projectID) this.setState({project:{}});
        // Get fresh copy of the current project from database, then apply it here
        Project.get(props.projectID).then(project => {
          // The database sometimes returns null right after data is modified, if so, do nothing.
          if(!project) return;
          // Because setting the project is a performance-expensive task, only continue if the project from the database is extrinsically different
          if(project.lastUpdatedTimestamp === this.state.project.lastUpdatedTimestamp && project.projectID === this.state.project.projectID) return;
          this.setState({ project });
        });
      
    }
  }

  async applySettings(values) {
    let project = this.state.project;
    await project.setName(values.general.name);
    await project.setDescription(values.general.description);
    await project.setRoles(values.roles);
    return true;
  }

  render() {
    return (
      <div
        style={{
          flex: 1,
          height: "100%",
          width:0
        }}
      >
        <Layout className="project-view-wrapper" style={this.state.style}>
          <Sider
            className="project-view-sider"
            width={this.state.siderWidth}
            style={{ display: this.state.hideSideBar ? "none" : "block" }}
          >
            <div
              style={{
                textAlign: "left",
                padding: "18px 22px",
                fontWeight: "bold"
              }}
            >
              {this.state.project.name || <Icon type="loading" />}
            </div>
            <ProjectSider
              pauseUpdate={this.state.pauseSiderUpdate}
              items={this.state.projectID ? Pages : UserPage}
              onItemSelected={itemSelectedArgs => {
                this.setState({ openedPage: itemSelectedArgs.item });
              }}
              onSettingsPress={() => {
                this.setState({ settingsVisible: true });
              }}
              onInviteUsersPress={() => {
                this.setState({ inviteUsersVisible: true });
              }}
            />
          </Sider>
          <Layout
            className="project-view-content"
            style={{
              transform:
                "translateX(" +
                (this.state.navigationCollapsed && !this.state.hideSideBar
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
              heading={this.state.openedPage.name || "Untitled"}
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
              <PageView
                project={this.state.project}
                contentType={this.state.openedPage.content}
              />
            </Content>
          </Layout>
        </Layout>
        <Settings
          project={this.state.project}
          visible={this.state.settingsVisible}
          onClose={() => {
            this.setState({ settingsVisible: false });
          }}
          onSave={async values => {
            await this.applySettings(values);
            this.setState({ settingsVisible: false });
            message.success("Your changes were saved.");
          }}
        />
        <SendInvite
          project={this.state.project}
          visible={this.state.inviteUsersVisible}
          onClose={() => {
            this.setState({ inviteUsersVisible: false });
          }}
          onSend={() => {
            this.setState({ inviteUsersVisible: false }); 
          }}
        />
      </div>
    );
  }
}