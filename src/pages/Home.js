import React, { Component } from "react";

import Fire from "../classes/Fire";

import UserIcon from "../components/UserIcon";
import "./User.css";
import User from "../classes/User";

import { Button, Icon } from "antd";
import { Card } from "antd";
import ProjectInvitation from "../components/ProjectInvitation";
import ProjectDisplay from "../components/ProjectDisplay";
import formatJSON from "format-json-pretty";
import ContextProvider from "../components/ContextProvider";
import { Scrollbars } from "react-custom-scrollbars";

export default class HOME extends Component {
  state = {
    user: {} // The current user.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Update the user to match the properties.
    this.setState({ user: props.user });
  }

  shouldComponentUpdate(props, state) {
    if (!User.equal(this.state.user, props.user)) return true;
    if (!User.equal(this.state.user, state.user)) return true;
    // If the user hasn't changed then don't update anything.
    return false;
  }

  /**
   * Generate a gallery of project cards.
   * @param  {String} name 
   * @param  {String} notFoundMessage 
   * @param  {Object[]} data 
   * @param  {(data:Object)=>{}:JSX.ELement} renderComponent 
   * @return 
   * @memberof USER
   */
  generateProjectCards(name, notFoundMessage, data, renderComponent) {
    return (
      <Card title={name}>
        <Scrollbars
          style={{ margin: -24, width: "calc(100% + 48px)" }}
          autoHide
          hideTracksWhenNotNeeded
          autoHeight
          autoHeightMax={1000}
        >
          <div style={{ display: "flex", padding: 24 }}>
            {!!data && !!data.length
              ? data.map((item, index) => (
                <div style={{ paddingRight: 20, flex: "none" }} key={index}>
                  <ContextProvider projectID={item} userID={this.state.user.uid}>
                    {renderComponent(item)}
                  </ContextProvider>
                </div>
              ))
              : notFoundMessage}
          </div>
        </Scrollbars>
      </Card>
    );
  }

  render() {
    return (
      <div>
        {this.state.user && this.state.user.uid ? (
          <div style={{ textAlign: "left" }}>
            <Card>
              <center className="pattern">
                <br />
                <br />
                <Icon type="fire" style={{ fontSize: 47, color: "#282828" }} />
                <br />
                <br />
                <h1>
                  Cool things are coming soon.
                  </h1>
                <br />
              </center>
            </Card>
            <br />
            <Card>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "center"
                }}
              >
                <div
                  style={{
                    margin: "0 2.5vw",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 36 }}>
                    {this.state.user.projects ? this.state.user.projects.length : 0}
                  </div>
                  <p>Projects</p>
                </div>
                <div
                  style={{
                    margin: "0 2.5vw",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 36 }}>
                    {this.state.user.joinedProjects ? this.state.user.joinedProjects.length : 0}
                  </div>
                  <p>Joined Projects</p>
                </div>
                <div
                  style={{
                    margin: "0 2.5vw",
                    textAlign: "center"
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 36 }}>
                    {this.state.user.pendingInvites ? this.state.user.pendingInvites.length : 0}
                  </div>
                  <p>Invites</p>
                </div>
              </div>
            </Card>
            <br />
            {this.generateProjectCards(
              "Projects",
              "Create a project by selecting the + icon on the navigation bar.",
              this.state.user.projects,
              data => (
                <ProjectDisplay
                  onOpenPressed={() => {
                    this.props.passMessage({ type: "switchTo", content: data });
                  }}
                />
              )
            )}
            <br />
            {this.generateProjectCards("Joined", "You haven't joined any projects.", this.state.user.joinedProjects, data => (
              <ProjectDisplay
                onOpenPressed={() => {
                  this.props.passMessage({ type: "switchTo", content: data });
                }}
              />
            ))}
            <br />
            {this.generateProjectCards(
              "Invites",
              "You haven't been invited to any projects.",
              this.state.user.pendingInvites,
              data => (
                <ProjectInvitation
                  onAcceptInvite={() => {
                    this.state.user.acceptInvite(data);
                  }}
                  onRejectInvite={() => {
                    this.state.user.rejectInvite(data);
                  }}
                />
              )
            )}
          </div>
        ) : (
            <div>
              <Icon type="loading" />
            </div>
          )}
      </div>
    );
  }
}
