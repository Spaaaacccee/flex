import React, { Component } from "react";
import { Layout } from "antd";

import ProjectView from "./ProjectView";
import ProjectNavigation from "./ProjectNavigation";
import SignIn from "./SignIn";

const { Header, Footer, Sider, Content } = Layout;

export default class Main extends Component {
  state = {
    openedProjectID: "",
    navigationCollapsed: true,
    siderWidth: 64,
    breakpoint: 1024,
    currentlyWidescreen: false
  };

  componentDidMount() {
    this.relayout();
    window.addEventListener("resize", this.relayout.bind(this));
  }

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

  render() {
    return (
      <div
          style={{ height: "100%" }}
          className={this.state.currentlyWidescreen ? "widescreen" : ""}
      >
        <Layout>
          <Sider
              width={this.state.siderWidth}
              style={{
              overflow: "auto",
              height: "100vh",
              background: "hsla(216, 20%, 97%, 1)"
            }}
          >
            <ProjectNavigation
                items={[
                  {
                    name:"A",
                    thumbnail:"",
                    projectID:"aA"
                  },
                  {
                    name:"B",
                    thumbnail:"",
                    projectID:"bB"
                  },
                  {
                    name:"C",
                    thumbnail:"",
                    projectID:"cC"
                  }
                ]}
                onProjectChanged={projectChangedEvent => {
                this.setState({
                  openedProjectID: projectChangedEvent.item.projectID
                });
              }}
            />
          </Sider>
          <ProjectView
              style={{
              transform:
                "translateX(" +
                (this.state.navigationCollapsed
                  ? this.state.siderWidth * -1
                  : 0) +
                "px)",
              height: "100%"
            }}
              navigationCollapsed={this.state.navigationCollapsed}
              onNavButtonPress={() => {
              this.setState({
                navigationCollapsed: !this.state.navigationCollapsed
              });
            }}
              onContentPress={() => {
              this.setState({
                navigationCollapsed: this.state.currentlyWidescreen
                  ? false
                  : true
              });
            }}
              onNavDrag={() => {
              this.setState({
                navigationCollapsed: false
              });
            }}
              projectID={this.state.openedProjectID}
          />
        </Layout>
      </div>
    );
  }
}
