import React, { Component } from "react";

import { Layout, Icon, message, Popover, Card } from "antd";
import { Scrollbars } from "react-custom-scrollbars";
import ProjectSider from "./ProjectSider";
import PageView from "./PageView";
import Page, { Pages, HomePage, UserPage } from "../classes/Page";
import Fetch from "../classes/Fetch";
import Project from "../classes/Project";

import "./ProjectView.css";
import Settings from "./Settings";
import SendInvite from "./SendInvite";
import Backup from "../classes/Backup";
import MESSAGES from "../pages/Messages";

const { Sider } = Layout;

export default class ProjectView extends Component {
  static defaultProps = {
    projectID: null,
    siderWidth: 200,
    onNavButtonPress: () => {}, // A callback for when the expand/collapse navigation button is pressed
    onContentPress: () => {}, // A callback for when the main content area is pressed
    onNavDrag: () => {}, // A callback for when an open navigation gesture is performed
    navigationCollapsed: true,
    style: {},
    onMessage: () => {}
  };

  projectIndex={
    [-1]:HomePage,
    [-2]:UserPage,
  }

  state = {
    openedProjectIndex:-1,
    style: {}, // Pass the style attribute from the Component to the DOM element
    projectID: null, // The project ID of the project that should be displayed
    project: {}, // The associated project.
    openedPageIndex: 0, // The index of the page that is currently opened.
    navigationCollapsed: true, // Whether or not the in-project navigation bar should be collapsed
    hideSideBar: false, // Whether the side bar is currently hidden.
    settingsVisible: false, // Whether the settings window is currently open.
    inviteUsersVisible: false, // Whether the invite users window is currently open.
    pauseSiderUpdate: false, // Whether to pause updating of the sider.
    user: {} // The current user.
  };

  /**
   * A callback function for when a page loads.
   * @type {(e)=>{}}
   * @memberof ProjectView
   */
  onPageLoad = null;

  /**
   * A timer responsible for determining when to backup
   * @memberof ProjectView
   */
  backupTimer;

  /**
   * How long before each backup occurs, in minutes
   * @type {Number}
   * @memberof ProjectView
   */
  backupFrequency = 30;

  componentDidMount() {
    // Set the window so that when the tab is closed, the project is backed up.
    window.onbeforeunload = () => {
      if (!this.state.project || !Object.keys(this.state.project).length) return;
      Backup.backupProject(this.state.project.projectID, this.state.project);
    };

    // Set a backup timer to backup the project every x minutes.
    if (this.backupTimer) clearInterval(this.backupTimer);
    this.backupTimer = setInterval(() => {
      if (!this.state.project || !Object.keys(this.state.project).length) return;
      Backup.backupProject(this.state.project.projectID, this.state.project);
    }, 1000 * 60 * this.backupFrequency);
  }

  componentWillUnmount() {
    // Remove the callback for when the window closes.
    window.onbeforeunload = () => {};
    // Remove back up timer when the component unmounts.
    clearInterval(this.backupTimer);
  }

  componentWillReceiveProps(props) {
    // Define a listener to update the local project whenever the version on the database changes.
    let projectCallback = snapshot => {
      let project = snapshot.val();
      // If the new project is null or if no changes occured, then don't update.
      if (project === null) return;
      if (Project.equal(project, this.state.project)) return;
      if (project.deleted || !(project.members || []).find(x => x.uid === this.state.user.uid)) {
        // If the project has been deleted or the user no longer belongs in the project, then switch the navigation back to user page.
        this.props.onMessage({ type: "switchTo", content: null });
        Fetch.getProjectReference(this.state.projectID).off("value", projectCallback);
        snapshot.ref.off("value", projectCallback);
        return;
      }
      // If the selected project changed, then stop listening for changes to this project.
      if (project.projectID !== this.state.projectID) {
        snapshot.ref.off("value", projectCallback);
        return;
      }

      // Update the local copy of the project.
      this.setState({ project: Object.assign(new Project(), project) });
    };

    // Update this component to match its properties.
    this.setState(
      {
        openedProjectIndex: props.openedProjectIndex,
        style: props.style || this.state.style,
        pauseSiderUpdate: props.pauseSiderUpdate,
        navigationCollapsed: props.navigationCollapsed ? true : false,
        projectID: props.projectID,
        hideSideBar: props.hideSideBar,
        siderWidth: props.siderWidth,
        user: props.user
      },
      () => {
        if (!props.projectID) return;
        // Attach the listener.
        Fetch.getProjectReference(props.projectID).on("value", projectCallback);
      }
    );
  }

  /**
   * Apply all settings from the edit settings window.
   * @param  {{general:{name:String,description:String},roles: Role[]}} values
   * @return
   * @memberof ProjectView
   */
  async applySettings(values) {
    let project = this.state.project;
    // Apply the name
    if (project.name !== values.general.name) await project.setName(values.general.name);
    // Apply the description
    if (project.description !== values.general.description) await project.setDescription(values.general.description);
    // Apply the roles
    if (JSON.stringify(values.roles || []) !== JSON.stringify(this.state.project.roles || []))
      await project.setRoles(values.roles);
    return true;
  }

  render() {
    // Default to displaying the user page if no project is selected.
    const displayPages = this.state.projectID ? Pages : (this.projectIndex[this.state.openedProjectIndex]);
    // If the selected index is more than the available pages, cap the index at the last available option.
    const openIndex = Math.min(this.state.openedPageIndex, displayPages.length - 1);
    const openedPage = displayPages[openIndex];
    // If the page that is displayed is the user page, set the project to an empty object.
    const displayProject = Page.equal(openedPage, HomePage) ? {} : this.state.project;
    const hasPermission =
      !this.state.project ||
      !Object.keys(this.state.project).length ||
      (this.state.project.permissions || {})[this.state.user.uid] ||
      this.state.project.owner === this.state.user.uid;
    return (
      <div
        className={openedPage.name}
        style={{
          flex: 1,
          height: "100%",
          pointerEvents: "all",
          ...(this.state.project.deleted || !hasPermission ? { cursor: "not-allowed" } : {})
        }}
      >
        <Layout
          className="project-view-wrapper"
          style={{
            ...this.state.style,
            ...(this.state.project.deleted || !hasPermission ? { pointerEvents: "none", opacity: 0 } : {})
          }}
        >
          {/* The project sider*/}
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
                {/* The project name. */}
                {displayProject.name || <Icon type="loading" />}
              </b>
              {!!displayProject.description && (
                // the project description.
                <Popover placement="bottomLeft" content={displayProject.description}>
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
              project={this.state.project}
              user={this.state.user}
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
                (this.state.navigationCollapsed && !this.state.hideSideBar ? this.state.siderWidth * -1 : 0) +
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
              <Scrollbars autoHide hideTracksWhenNotNeeded>
                {/* The page view */}
                <PageView
                  onLeftButtonPress={this.props.onNavButtonPress}
                  onContentPress={this.props.onContentPress}
                  project={displayProject}
                  page={openedPage}
                  onLoad={page => {
                    if (this.onPageLoad) this.onPageLoad(page);
                  }}
                  onMessage={(msg => {
                    switch (msg.type) {
                      case "prepare-message":
                        // If the page asks to prepare a message, switch the page to the messages page.
                        this.setState({
                          openedPageIndex: 3
                        });
                        this.onPageLoad = messagesPage => {
                          // Send the prepared message once messages loads.
                          if (messagesPage instanceof MESSAGES) messagesPage.handleSendRaw(msg.content);
                          this.onPageLoad = null;
                        };
                        break;
                      case "navigate":
                        // If the page asks to switch the page, change the index to the specified page.
                        this.setState({
                          openedPageIndex: msg.content
                        });
                        break;
                      default:
                        // Otherwise, pass the message to the parent component.
                        this.props.onMessage(msg);
                        break;
                    }
                  }).bind(this)}
                />
              </Scrollbars>
            </div>
          </Layout>
        </Layout>
        {/* The Settings window */}
        <Settings
          user={this.state.user}
          project={displayProject}
          visible={this.state.settingsVisible}
          onClose={() => {
            this.setState({ settingsVisible: false });
          }}
          onSave={async values => {
            // When the user saves the settings, apply the settings and close the window.
            await this.applySettings(values);
            this.setState({ settingsVisible: false });
            message.success("Your changes were saved.");
          }}
        />
        {/* The Send Invite window */}
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
        <Card
          style={{
            position: "fixed",
            top: 20,
            left: " 50%",
            transform: "translateX(-50%)",
            maxWidth: 300,
            display: !hasPermission ? "block" : "none"
          }}
        >
          <Icon type="close-circle" style={{ color: "#FF4D4F", fontSize: 24, marginBottom: 10 }} />
          <br />
          {`You don't have permission to make changes to ${this.state.project.name}. Ask the owner to invite you.`}
        </Card>
      </div>
    );
  }
}
