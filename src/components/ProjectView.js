import React, { Component } from "react";

import { Layout, Icon, Modal, message, Popover } from "antd";
import TopBar from "./TopBar";
import ProjectSider from "./ProjectSider";
import PageView from "./PageView";
import Page, { Pages, UserPage } from "../classes/Page";
import Fetch from "../classes/Fetch";
import Project from "../classes/Project";

import "./ProjectView.css";
import Settings from "./Settings";
import SendInvite from "./SendInvite";

const { Header, Footer, Sider, Content } = Layout;

export default class ProjectView extends Component {
  static defaultProps = {
    projectID: null, // The project ID of the project that should be displayed
    siderWidth: 200,
    onNavButtonPress: () => {}, // A callback for when the expand/collapse navigation button is pressed
    onContentPress: () => {}, // A callback for when the main content area is pressed
    onNavDrag: () => {}, // A callback for when an open navigation gesture is performed
    navigationCollapsed: true, // Whether or not the in-project navigation bar should be collapsed
    style: {}, // Pass the style attribute from the Component to the DOM element
    onMessage: () => {}
  };

  state = {
    style: {},
    projectID: null,
    project: {},
    openedPageIndex: 0,
    navigationCollapsed: true,
    hideSideBar: false,
    settingsVisible: false,
    inviteUsersVisible: false,
    pauseSiderUpdate: false,
    user: {}
  };
  componentWillReceiveProps(props) {
    this.setState({
      style: props.style || this.state.style,
      pauseSiderUpdate: props.pauseSiderUpdate,
      navigationCollapsed: props.navigationCollapsed ? true : false,
      projectID: props.projectID,
      hideSideBar: props.hideSideBar,
      siderWidth: props.siderWidth,
      user: props.user
    });
    if (props.projectID === this.state.projectID) return;
    if (this.state.projectID) {
      Fetch.getProjectReference(this.state.projectID).off();
      this.setState({ project: {} });
    }
    if (!props.projectID) return;
    Fetch.getProjectReference(props.projectID).on("value", snapshot => {
      let project = snapshot.val();
      if (project === null) return;
      if (
        project.deleted ||
        !(project.members || []).find(x => x.uid === this.state.user.uid)
      ) {
        this.props.onMessage({ type: "switchTo", content: null });
        Fetch.getProjectReference(this.state.projectID).off();
        return;
      }
      this.setState({ project: Object.assign(new Project(), project) });
    });
  }

  async applySettings(values) {
    let project = this.state.project;
    if (project.name !== values.general.name)
      await project.setName(values.general.name);
    if (project.description !== values.general.description)
      await project.setDescription(values.general.description);
    await project.setRoles(values.roles);
    return true;
  }

  render() {
    const displayPages = this.state.projectID ? Pages : UserPage;
    const openIndex = Math.min(
      this.state.openedPageIndex,
      displayPages.length - 1
    );
    const openedPage = displayPages[openIndex];
    const displayProject = Page.equal(openedPage, UserPage)
      ? {}
      : this.state.project;
    return (
      <div
        className={openedPage.name}
        style={{
          flex: 1,
          height: "100%",
          width: 0
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
                padding: "18px 22px"
              }}
            >
              <b
                style={{
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  width: "100%",
                  display: "block"
                }}
              >
                {displayProject.name || <Icon type="loading" />}
              </b>
              {!!displayProject.description && (
                <Popover
                  placement="bottomLeft"
                  content={displayProject.description}
                >
                  <p
                    style={{
                      opacity: 0.65,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      marginTop: 5,
                      marginBottom: 0
                    }}
                  >
                    {displayProject.description}
                  </p>
                </Popover>
              )}
            </div>
            <ProjectSider
              items={displayPages}
              index={openIndex}
              onItemSelected={itemSelectedArgs => {
                this.setState({ openedPageIndex: itemSelectedArgs.index });
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
            <div
              className="project-view-inner-content"
              onTouchStart={e => {
                //handle touch gesture
                var threshold = 70;
                var leftThreshold = 30;
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
            >
              <PageView
                onLeftButtonPress={this.props.onNavButtonPress}
                onContentPress={this.props.onContentPress}
                project={displayProject}
                page={openedPage}
                onMessage={(msg => {
                  switch (msg.type) {
                    case "navigate":
                      this.setState({
                        openedPageIndex: msg.content
                      });
                      break;
                    default:
                      this.props.onMessage(msg);
                      break;
                  }
                }).bind(this)}
              />
            </div>
          </Layout>
        </Layout>
        <Settings
          user={this.state.user}
          project={displayProject}
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
          project={displayProject}
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
