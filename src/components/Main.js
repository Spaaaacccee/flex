import React, { Component } from "react";
import { Layout, Modal } from "antd";

import ProjectView from "./ProjectView";
import ProjectNavigation from "./ProjectNavigation";
import SignIn from "./SignIn";
import CreateProject from "../forms/CreateProject";

import Fire from "../classes/Fire";
import User from "../classes/User";
import Project from "../classes/Project";
import Fetch from "../classes/Fetch";

import "./Main.css";

const { Sider, Content } = Layout;

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
    breakpoint: 1024, // The screen-width in which the layout adopt a widescreen format
    currentlyWidescreen: false, // Whether the screen is currently wider than the breakpoint
    user: null,
    userData: null,
    modal: {
      visible: false,
      content: <div />
    }
  };

  /**
   * Ininitialisation method when the component is mounted
   * @memberof Main
   */
  componentDidMount() {
    this.relayout();
    window.addEventListener("resize", this.relayout.bind(this)); // Respond to window resize by relayouting
    setInterval(() => {
      this.forceUpdate();
    }, 250);
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
    if (await User.exists(logInargs.user.uid)) {
      await User.update(logInargs.user.uid, {
        lastLogInTimestamp: Date.now()
      });
    } else {
      await User.update(logInargs.user.uid, new User(logInargs.user.uid));
    }
    this.setState({
      user: logInargs.user
    });
    Fetch.getUserReference(logInargs.user.uid).on("value", snapShot => {
      this.setState({
        userData: snapShot.val()
      });
    });
    this.forceUpdate();
  }

  render() {
    return (
      <div
        style={{ height: "100%" }}
        className={this.state.currentlyWidescreen ? "widescreen" : ""}
      >
        <Layout className="main-layout">
          {/* Project navigation bar */}
          <Sider width={this.state.siderWidth} className="project-sider">
            {/* Project navigation items */}
            <ProjectNavigation
              user={this.state.user}
              items={this.state.userData ? this.state.userData.projects : []}
              onProjectChanged={projectChangedArgs => {
                this.setState({
                  openedProjectID: projectChangedArgs.item
                });
              }}
              onUserProfilePress={() => {
                this.setState({
                  openedProjectID: null
                });
              }}
              onAddIconPress={() => {
                this.setState({
                  modal: {
                    visible: true,
                    content: <CreateProject onSubmit={async (data)=>{
                      data.projectName = data.projectName || "Untitled Project";
                      (await User.getCurrentUser()).newProject(new Project(data.projectName)).then(()=>{
                        this.setState({
                          modal:{
                            visible:false
                          }
                        });
                      });

                    }}/>
                  }
                });
              }}
            />
          </Sider>
          {/* Secondary navigation bar and main content */}
          <ProjectView
            style={{
              // Move the project view left by the sider width when the screen is too narrow to achieve an effect as if the navigation sidebar collapses. This ensures smooth 60fps animation performance on most devices.
              transform:
                "translateX(" +
                (this.state.navigationCollapsed
                  ? this.state.siderWidth * -1
                  : 0) +
                "px)",
              height: "100%"
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
                navigationCollapsed: this.state.currentlyWidescreen
                  ? false
                  : true
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
        <SignIn onLogIn={this.handleLogIn.bind(this)} />
        <Modal
          visible={this.state.modal.visible}
          onCancel={() => {
            this.setState({
              modal: { visible: false }
            });
          }}
          footer={null}
        >
          {this.state.modal.content}
        </Modal>
      </div>
    );
  }
}
