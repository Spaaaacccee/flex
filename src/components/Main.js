import React, { Component } from "react";
import { Layout, Modal, Icon, message } from "antd";

import ProjectView, { getPages } from "./ProjectView";
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
import Momentum from "../classes/Momentum";

import "./Main.css";
import Touch from "../classes/Touch";
import { DEFAULT_PAGE_SIDER_WIDTH, DEFAULT_SIDER_WIDTH } from "../classes/Config";

export const ProjectContext = new AppContext({});
export const UserContext = new AppContext({});

const { Sider } = Layout;

let ref;
let projectViewContentRef;

/**
 * The main interface
 * @export Main
 * @class Main
 * @extends Component
 */

export default class Main extends Component {
  state = {
    siderWidth: DEFAULT_SIDER_WIDTH, // The width of the left-most sidebar
    pageSiderWidth: DEFAULT_PAGE_SIDER_WIDTH,
    breakpoint: 1280, // The screen-width in which the layout adopt a widescreen format
    widescreen: false, // Whether the screen is currently wider than the breakpoint
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
    availableMessengers: {},

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
    if (window.innerWidth >= this.state.breakpoint) {
      if (!this.state.widescreen) {
        this.setState({ widescreen: true });
        this.openNavigation();
      }
    } else {
      if (this.state.widescreen) {
        this.setState({ widescreen: false });
        this.closeNavigation();
      }
    }
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

  recalculateSidersWidth(callback) {
    this.setState({
      pageSiderWidth: getPages(this.state.navigation).length - 1 ? DEFAULT_PAGE_SIDER_WIDTH : 0
    }, () => {
      callback && callback();
    })
  }

  openNavigation(immediately) {
    this.recalculateSidersWidth(() => {
      this.navigationPaneMomentum.to = this.state.pageSiderWidth + this.state.siderWidth;
      if (immediately) {
        this.navigationPaneMomentum.mode = "controlled";
        this.navigationPaneMomentum.controlledValue = this.navigationPaneMomentum.to;
      } else {
        this.navigationPaneMomentum.target = this.navigationPaneMomentum.to;
        this.navigationPaneMomentum.mode = "targetedMomentum";
      }
    });
  }

  closeNavigation(immediately) {
    this.recalculateSidersWidth(() => {
      if (immediately) {
        this.navigationPaneMomentum.mode = "controlled";
        this.navigationPaneMomentum.controlledValue = 0;
      } else {
        this.navigationPaneMomentum.mode = "targetedMomentum";
        this.navigationPaneMomentum.target = 0;
      }
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
        : {},
    }, () => {
      this.openNavigation(true);
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

  projectViewContentRef;
  projectViewRef;
  _navTouchRegistered = false;
  navigationPaneMomentum;

  registerNavTouch(projectViewRef, projectViewContentRef) {

    if (projectViewContentRef && projectViewRef && !this._navTouchRegistered) {
      const self = this;
      this._navTouchRegistered = true;
      this.recalculateSidersWidth(() => {
        const getTotalSiderWidth = () => self.state.siderWidth + self.state.pageSiderWidth;
        self.navigationPaneMomentum = new Momentum({
          mode: "controlled",
          from: 0,
          value: 0,
          to: getTotalSiderWidth(),
          selectTarget: (to, from, velocity, value) => {
            if (Math.abs(velocity) > 0.1) {
              if (velocity > 0) { return to }
              else { return from; }
            } else {
              if (value > (from + to) / 2) { return to; }
              else { return from; }
            }
          },
          calculateValue: (to, from, controlledValue) => {
            if (controlledValue > to) return to + Math.pow(controlledValue - to, 0.6);
            if (controlledValue < from) return from - Math.pow(from - controlledValue, 0.6);
            return controlledValue;
          },
          targets: [
            (value) => {
              const totalSiderWidth = getTotalSiderWidth();
              let projectViewContentPosition = value * (self.state.pageSiderWidth / totalSiderWidth) - self.state.pageSiderWidth;
              if (projectViewContentPosition > 0) {
                projectViewContentPosition = 0;
              }
              self.projectViewContentRef.style.transform = `translate3d(${projectViewContentPosition}px,0,0)`
            },
            (value) => {
              const totalSiderWidth = getTotalSiderWidth();
              let projectViewPosition = value * (self.state.siderWidth / totalSiderWidth) - self.state.siderWidth;
              if (projectViewPosition > 0) {
                projectViewPosition = value - totalSiderWidth;
              }
              self.projectViewRef.style.transform = `translate3d(${projectViewPosition}px,0,0)`;
            },
          ]
        });
        self.navigationPaneMomentum.broadcastValue();
        const touchManager = new Touch();
        let touchEnabled = false;
        self.projectViewContentRef.addEventListener("touchstart", (e) => {
          if (e.touches[0].pageX > DEFAULT_SIDER_WIDTH + self.navigationPaneMomentum.value) return;
          touchEnabled = true;
          touchManager.registerTouchStart(e);
          self.navigationPaneMomentum.mode = "controlled";
        });
        self.projectViewContentRef.addEventListener("touchmove", (e) => {
          if (!touchEnabled) return;
          touchManager.registerTouchMove(e);
          self.navigationPaneMomentum.controlledValue += touchManager.getRecentDeltaPosition().x;
        });
        self.projectViewContentRef.addEventListener("touchend", (e) => {
          if (!touchEnabled) return;
          touchManager.registerTouchEnd(e);
          self.navigationPaneMomentum.mode = "momentum";
          touchEnabled = false;
        });
      })

    }
  }

  render() {
    const {
      widescreen,
      siderWidth,
      modal,
      offline,
      availableProjects,
      auth,
      breakpoint,
      navigation,
      navigationOpenMultiplier,
      user,
      project,
      pageSiderWidth
    } = this.state;
    UserContext.provide(user, (a, b) => User.equal(a, b));
    ProjectContext.provide(project, (a, b) => Project.equal(a, b));
    return (
      <div style={{ height: "100%", width: "100vw" }} className={widescreen ? "widescreen" : ""}>
        <Layout className="main-layout">
          {/* Project navigation bar */}
          <Sider width={DEFAULT_SIDER_WIDTH} className="project-sider">
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
          <div
            className="project-view-animation-container"
            ref={(e) => {
              this.projectViewRef = e;
              this.registerNavTouch(e, this.projectViewContentRef);
            }}
            style={{
              transition: "none !important"
            }}>
            <ProjectView
              siderWidth={DEFAULT_PAGE_SIDER_WIDTH}
              onProjectViewContentRef={
                (e) => {
                  this.projectViewContentRef = e;
                  this.registerNavTouch(this.projectViewRef, e);
                }}
              navigation={navigation}
              onNavButtonPress={() => {

                if (this.navigationPaneMomentum.value === this.navigationPaneMomentum.to) {
                  this.closeNavigation();
                } else {
                  this.openNavigation();
                }
                this.navigationPaneMomentum.mode = "targetedMomentum";
              }}
              onContentPress={() => {
                this.closeNavigation();
              }}
              onMessage={msg => {
                switch (msg.type) {
                  case "switchTo":
                    this.handleNavigation({ type: "project", projectID: msg.content });
                    break;
                  default:
                    break;
                }
              }}
              pauseSiderUpdate={navigationOpenMultiplier}
              style={{
                transition: "none",
                // Move the project view left by the sider width when the screen is too narrow to achieve an effect as if the navigation sidebar collapses. This ensures smooth 60fps animation performance on most devices.
                height: "100%",
                width: "100%"
              }}

            /></div>
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

