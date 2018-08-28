import React, { Component } from "react";
import { Layout, Modal, Icon } from "antd";

import ProjectView from "./ProjectView";
import ProjectNavigation from "./ProjectNavigation";
import SignIn from "./SignIn";
import CreateProject from "../forms/CreateProject";

import Fire from "../classes/Fire";
import User from "../classes/User";
import Project from "../classes/Project";
import Fetch from "../classes/Fetch";

import "./Main.css";

const { Sider } = Layout;

/**
 * The main interface
 * @export Main
 * @class Main
 * @extends Component
 */

export default class Main extends Component {
  state = {
    openedProjectID: "", // The project ID of the currently opened, or on-screen project
    navigationCollapsed: true, // Whether the navigation sidebars (left-side) are collapsed
    siderWidth: 64, // The width of the left-most sidebar
    breakpoint: 1280, // The screen-width in which the layout adopt a widescreen format
    currentlyWidescreen: false, // Whether the screen is currently wider than the breakpoint
    user: {}, // The auth data current user
    userData: {}, // The project data of the current user
    modal: {
      visible: false, // Whether the add project modal is currently visible
    },
    useUpdateLoop: false, // An update loop is used to periodically pull data from the database and update the UI. To disable it, set this to false
    updateLoopSleepTime: 75, // The coefficent of the time to wait between each update. Higher means better performance at the cost of a slower update rate
    updateLoopSleeptimeMaximum: 10000, // the maximum time to wait between each update.
    offline: false // Whether the app is currently offline
  };

  /**
   * Ininitialisation method when the component is mounted
   * @memberof Main
   */
  componentDidMount() {
    this.relayout();
    // Respond to window resize by relayouting
    window.addEventListener("resize", this.relayout.bind(this));
    // Initiate the update loop
    this.updateLoop();
  }

  /**
   * Recursive loop, that calls `this.forceUpdate()` over and over again.
   * @return {void}
   * @memberof Main
   */
  updateLoop() {
    if (!this.state.useUpdateLoop) return;
    // Record the time before the update occurs
    let initialTime = Date.now();
    this.forceUpdate(() => {
      // Record the time after the update occurs
      let finalTime = Date.now();
      // Schedule the next update. The delay before the next update is proportional to the time the last update took. This means a device that executes javascript slower use less CPU time on updating the UI, preventing it from becoming laggy and unresponsive.
      // A maximum sleep time is also set to prevent the app from never getting any data from the database, in the case that `updateLoopSleepTime` is set too high or the device is extremely slow.
      setTimeout(() => {
        this.updateLoop();
      }, Math.min((finalTime - initialTime) * this.state.updateLoopSleepTime, this.state.updateLoopSleeptimeMaximum));
    });
  }

  /**
   * Relayout the interface based on screen size and the breakpoint
   * @memberof Main
   */
  relayout() {
    this.setState(
      window.innerWidth >= this.state.breakpoint
        ? {
            navigationCollapsed: false,
            currentlyWidescreen: true
          }
        : {
            navigationCollapsed: true,
            currentlyWidescreen: false
          }
    );
  }

  async handleLogIn(logInargs) {
    // Update the user in the database with the latest data from the authentication source
    await User.forceUpdate(logInargs.user.uid, {
      uid: logInargs.user.uid, // The UID of the user in the database should match the UID of the user from the authentication source
      email: logInargs.user.email || null,
      name: logInargs.user.displayName || null,
      profilePhoto: logInargs.user.photoURL || null,
      lastLogInTimestamp: Date.now()
    });
    // Add the current user to component state so it could be accessed by children
    this.setState({
      user: logInargs.user
    });
    // Get the latest information for this user from the database
    Fetch.getUserReference(logInargs.user.uid).on("value", snapShot => {
      // Only update the user data if data exists in the database. It is ok if the current user does not exist as it will be created when necessary.
      if (!snapShot.val()) return;
      this.setState({
        userData: Object.assign(new User(), snapShot.val())
      });
    });
    // Initialise offline/online indicator, in response to a special register in the firebase database API
    Fire.firebase()
      .database()
      .ref(".info/connected")
      .on("value", snapshot => {
        this.setState({ offline: !snapshot.val() });
      });
  }

  render() {
    return (
      <div style={{ height: "100%", width: "100vw" }} className={this.state.currentlyWidescreen ? "widescreen" : ""}>
        <Layout className="main-layout">
          {/* Project navigation bar */}
          <Sider width={this.state.siderWidth} className="project-sider">
            {/* Project navigation items */}
            <ProjectNavigation
              onMessage={msg => {
                switch (msg.type) {
                  case "switchTo":
                    this.setState({ openedProjectID: msg.content });
                    break;
                  default:
                    break;
                }
              }}
              pauseUpdate={this.state.navigationCollapsed}
              user={this.state.user}
              // Here we're displaying all user projects, only if they exist
              items={
                this.state.userData
                  ? [...(this.state.userData.projects || []), ...(this.state.userData.joinedProjects || [])]
                  : []
              }
              openedProject={this.state.openedProjectID}
              onProjectChanged={projectChangedArgs => {
                // Respond to when the selected project changes by setting the selected item in the component state
                this.setState({
                  openedProjectID: projectChangedArgs.item
                });
              }}
              onUserProfilePress={() => {
                // Respond to when the user profile button is pressed by setting the selected item in the component state to null. This will cause the user profile to open
                this.setState({
                  openedProjectID: null
                });
              }}
              onAddIconPress={() => {
                // Respond to when the add user button is pressed by making the add project modal visible
                this.setState({
                  modal: {
                    visible: true
                  }
                });
              }}
            />
          </Sider>
          {/* Secondary navigation bar and main content */}
          <ProjectView
            user={this.state.userData}
            onMessage={msg => {
              switch (msg.type) {
                case "switchTo":
                  this.setState({ openedProjectID: msg.content });
                  break;
                default:
                  break;
              }
            }}
            pauseSiderUpdate={this.state.navigationCollapsed}
            style={{
              // Move the project view left by the sider width when the screen is too narrow to achieve an effect as if the navigation sidebar collapses. This ensures smooth 60fps animation performance on most devices.
              transform: "translateX(" + (this.state.navigationCollapsed ? this.state.siderWidth * -1 : 0) + "px)",
              height: "100%",
              width: "100%"
            }}
            // The project view has its own navigation sidebar. Sync that side bar with the main project sidebar.
            navigationCollapsed={this.state.navigationCollapsed}
            // Respond to when the hamburger button is pressed by toggling the navigation sidebar
            onNavButtonPress={() => {
              this.setState({
                navigationCollapsed: !this.state.navigationCollapsed
              });
            }}
            // Respond to when the main content is pressed by collapsing the sidebar, only if it's currently not widescreen
            onContentPress={() => {
              this.setState({
                navigationCollapsed: this.state.currentlyWidescreen ? false : true
              });
            }}
            // Respond to when a drag gesture is used to open the navigation bar
            onNavDrag={() => {
              this.setState({
                navigationCollapsed: false
              });
            }}
            // Hide the sidebar when the project ID is empty
            hideSideBar={!this.state.openedProjectID}
            // Sync the project ID of the project view with the opened project's ID
            projectID={this.state.openedProjectID}
          />
        </Layout>
        {/* The sign in splashscreen. Automatically disappears when the user is logged in */}
        <SignIn onLogIn={this.handleLogIn.bind(this)} />
        {/* The create project modal */}
        <Modal
          destroyOnClose
          getContainer={() => document.querySelector(".modal-mount > div:first-child")}
          visible={this.state.modal.visible}
          onCancel={() => {
            this.setState({
              modal: { visible: false }
            });
          }}
          footer={null}
          maskClosable={false}
          key={this.state.modal.key}
        >
          <CreateProject
            opened={this.state.modal.visible}
            // What to do when the user confirms creating a project
            onSubmit={async data => {
              // Set a default name in case the entered project name is empty.
              data.projectName = data.projectName || "Untitled Project";
              let newProject = new Project(data.projectName);
              newProject.description = data.description;
              // Wait for the application to create a new project
              await (await User.getCurrentUser()).newProject(newProject);
              // Invite try to invite the selected users
              await Promise.all(
                (data.recipients || []).map(async item => (await User.get(item.key)).addInvite(newProject.projectID))
              );
              // Update the UI to close the form
              this.setState({
                modal: {
                  visible: false
                },
                openedProjectID: newProject.projectID
              });
            }}
          />
        </Modal>
        {/*The modal that appears when the user is offline*/}
        <Modal
          destroyOnClose
          getContainer={() => document.querySelector(".modal-mount > div:first-child")}
          closable={false}
          footer={null}
          maskClosable={false}
          visible={this.state.offline}
          style={{ textAlign: "center", maxWidth: 150, margin: "auto" }}
        >
          <Icon type="disconnect" style={{ color: "#FF4D4F", fontSize: 24 }} />
          <br />
          <h3 style={{opacity:0.65}}>Offline</h3>
        </Modal>
      </div>
    );
  }
}
