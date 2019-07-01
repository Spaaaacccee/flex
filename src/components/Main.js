import React, { Component } from "react";
import { Layout, Modal, Icon, message } from "antd";

import ProjectView from "./ProjectView";
import ProjectNavigation, { NavigationData } from "./ProjectNavigation";
import SignIn from "./SignIn";
import CreateProject from "../forms/CreateProject";

import Fire from "../classes/Fire";
import User from "../classes/User";
import Project from "../classes/Project";
import Fetch from "../classes/Fetch";
import firebase from 'firebase';
import $ from '../classes/Utils';
import AppContext from "../classes/AppContext";

import "./Main.css";


export const ProjectContext = new AppContext({});
export const UserContext = new AppContext({});

const { Sider } = Layout;


/**
 * The main interface
 * @export Main
 * @class Main
 * @extends Component
 */

export default class Main extends Component {
  state = {
    // UI
    navigationCollapsed: true, // Whether the navigation sidebars (left-side) are collapsed
    siderWidth: 64, // The width of the left-most sidebar
    breakpoint: 1280, // The screen-width in which the layout adopt a widescreen format
    currentlyWidescreen: false, // Whether the screen is currently wider than the breakpoint
    offline: false, // Whether the app is currently offline
    modal: {
      visible: false // Whether the add project modal is currently visible
    },
    navigation: new NavigationData({ type: "special", name: "Home" }),

    // Data
    auth: {}, // The auth data current user
    user: {}, // The user data of the current user
    project: {}, // The project data of the current user
    availableProjects: [],

    // Updates
    useUpdateLoop: false, // An update loop is used to periodically pull data from the database and update the UI. To disable it, set this to false
    updateLoopSleepTime: 75, // The coefficent of the time to wait between each update. Higher means better performance at the cost of a slower update rate
    updateLoopSleeptimeMaximum: 10000, // the maximum time to wait between each update.
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

  async handleLogIn(logInArgs) {
    // Update the user in the database with the latest data from the authentication source
    await User.forceUpdate(logInArgs.user.uid, {
      uid: logInArgs.user.uid, // The UID of the user in the database should match the UID of the user from the authentication source
      email: logInArgs.user.email || null,
      name: logInArgs.user.displayName || null,
      profilePhoto: firebase.auth().currentUser['providerData'][0]['photoURL'] || null,
      lastLogInTimestamp: Date.now()
    });
    // Add the current user to component state so it could be accessed by children
    this.setState({
      auth: logInArgs.user
    });
    this.setUserListener(logInArgs.user);
    // Initialise offline/online indicator, in response to a special register in the firebase database API
    Fire.firebase()
      .database()
      .ref(".info/connected")
      .on("value", snapshot => {
        this.setState({ offline: !snapshot.val() });
      });
  }

  /**
   * Takes new navigational data, and sets appropriate project and navigational states
   * @param  {NavigationData} navigationData 
   * @return {void}
   * @memberof Main
   */
  handleNavigation(navigationData) {
    this.setState({
      navigation: navigationData,
      project: navigationData.type === "project"
        ? this.state.availableProjects.find(project => project.projectID === navigationData.projectID)
        : {}
    });
  }

  /**
   * Set up listeners for the user
   * @param  {firebase.User} auth 
   * @return {void}
   * @memberof Main
   */
  setUserListener(auth) {
    const ref = Fetch.getUserReference(auth.uid);
    ref.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const user = Object.assign(new User(), data);
        this.setState({ user }, () => {
          this.setProjectListeners(user);
        });
      }
    });
  }

  /**
   * @type {(snapshot : firebase.database.DataSnapshot)=>void}
   * @memberof Main
   */
  projectListener = (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const project = Object.assign(new Project(), data);
      let availableProjectMap = this.state.availableProjects.reduce((prev, current) => ({
        ...prev,
        [current.projectID]: current
      }), {});
      availableProjectMap[project.projectID] = project;
      this.setState({
        availableProjects: $.object(availableProjectMap).values()
      })
    }
  };

  /**
   * Sets up listeners for all projects the user has.
   * @param  {User} user 
   * @return {void}
   * @memberof Main
   */
  async setProjectListeners(user) {
    const allUserProjects = [...user.projects, ...user.joinedProjects]
    // Remove unneeded projects. 
    this.state.availableProjects.filter(availableProject => !allUserProjects.find(userProjectID => userProjectID === availableProject.projectID)).forEach(removedProject => {
      Fetch.getProjectReference(removedProject.projectID).off("value", this.projectListener);
    })

    // Add new projects
    allUserProjects.filter(userProjectID => !this.state.availableProjects.find(availableProject => availableProject.projectID === userProjectID)).forEach(newProjectID => {
      Fetch.getProjectReference(newProjectID).on("value", this.projectListener);
    });
  }

  render() {
    const {
      currentlyWidescreen,
      siderWidth,
      modal,
      offline,
      availableProjects,
      auth,
      breakpoint,
      navigation,
      navigationCollapsed,
      user,
      project
    } = this.state;
    UserContext.provide(user, (a, b) => User.equal(a, b));
    ProjectContext.provide(project, (a, b) => Project.equal(a, b));
    return (
      <div style={{ height: "100%", width: "100vw" }} className={currentlyWidescreen ? "widescreen" : ""}>
        <Layout className="main-layout">
          {/* Project navigation bar */}
          <Sider width={siderWidth} className="project-sider">
            {/* Project navigation items */}
            <ProjectNavigation
              availableProjects={availableProjects}
              onMessage={msg => {
                switch (msg.type) {
                  case "switchTo":
                    this.setState({ openedProjectID: msg.content });
                    break;
                  default:
                    break;
                }
              }}
              navigation={navigation}
              onNavigation={this.handleNavigation.bind(this)}
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
            navigation={navigation}
            onMessage={msg => {
              switch (msg.type) {
                case "switchTo":
                  this.handleNavigation({ type: "project", projectID: msg.content });
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

          />
        </Layout>
        {/* The sign in splashscreen. Automatically disappears when the user is logged in */}
        <SignIn onLogIn={(logInArgs) => { this.handleLogIn(logInArgs) }} />
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
          key={modal.key}
        >
          <CreateProject
            opened={modal.visible}
            // What to do when the user confirms creating a project
            onSubmit={async data => {
              // Set a default name in case the entered project name is empty.
              data.projectName = data.projectName || "Untitled Project";
              let newProject = new Project(data.projectName);
              newProject.description = data.description;
              // Wait for the application to create a new project
              await (await User.getCurrentUser()).newProject(newProject);
              // Grant all selected users permission to use the project.
              Promise.all(
                data.recipients.map(async item => {
                  // Grant permission if they do not already have permission.
                  if (!(newProject.permissions || {})[item.key]) {
                    await newProject.setPermission(item.key, true);
                    message.info(`We gave permission to ${(await User.get(item.key)).name} to make changes. `);
                  }
                })
              );
              // Invite all selected users.
              await Promise.all(
                data.recipients.map(async item => (await User.get(item.key)).addInvite(newProject.projectID))
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
          visible={offline}
          style={{ textAlign: "center", maxWidth: 150, margin: "auto" }}
        >
          <Icon type="disconnect" style={{ color: "#FF4D4F", fontSize: 24 }} />
          <br />
          <h3 style={{ opacity: 0.65 }}>Offline</h3>
        </Modal>
      </div>
    );
  }
}

