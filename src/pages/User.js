import React, { Component } from "react";

import Fire from "../classes/Fire";

import UserIcon from "../components/UserIcon";
import "./User.css";
import User from "../classes/User";

import { Button, Modal, Icon, Popconfirm, Badge } from "antd";
import { Card } from "antd";
import Project from "../classes/Project";
import ProjectIcon from "../components/ProjectIcon";
import ProjectInvitation from "../components/ProjectInvitation";
import ProjectDisplay from "../components/ProjectDisplay";
import formatJSON from "format-json-pretty";
import ContextProvider from "../components/ContextProvider";

export default class USER extends Component {
  state = {
    user: {}
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({ user: props.user });
  }

  shouldComponentUpdate(props, state) {
    if (!User.equal(this.state.user, props.user)) return true;
    if (!User.equal(this.state.user, state.user)) return true;
    return false;
  }

  generateProjectCards(name, notFoundMessage, data, renderComponent) {
    return (
      <Card title={name}>
        <div style={{ display: "flex" }}>
          {!!data && !!data.length
            ? data.map((item, index) => (
                <div style={{ paddingRight: 20, flex: "none" }} key={index}>
                  <ContextProvider
                    projectID={item}
                    userID={this.state.user.uid}
                  >
                    {renderComponent(item)}
                  </ContextProvider>
                </div>
              ))
            : notFoundMessage}
        </div>
      </Card>
    );
  }

  render() {
    return (
      <div>
        {this.state.user && this.state.user.uid ? (
          <div style={{ textAlign: "left" }}>
            <div style={{ textAlign: "center" }}>
              <div className="user-page-icon">
                <UserIcon thumbnail={this.state.user.profilePhoto} />
              </div>
              <div style={{ marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700
                  }}
                >
                  {this.state.user.name || <Icon type="loading"/>}
                </span>
              </div>
              <div style={{ marginBottom: 20 }}>
                {this.state.user.email || <Icon type="loading"/>}
              </div>
              <div>
                <Button
                  type="primary"
                  onClick={() => {
                    Fire.firebase()
                      .auth()
                      .signOut();
                    window.location.reload(true);
                  }}
                >
                  Sign Out
                </Button>
              </div>
              <br />
              <br />
            </div>
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
                    {this.state.user.projects
                      ? this.state.user.projects.length
                      : 0}
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
                    {this.state.user.joinedProjects
                      ? this.state.user.joinedProjects.length
                      : 0}
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
                    {this.state.user.pendingInvites
                      ? this.state.user.pendingInvites.length
                      : 0}
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
            {this.generateProjectCards(
              "Joined",
              "You haven't joined any projects.",
              this.state.user.joinedProjects,
              data => (
                <ProjectDisplay
                  onOpenPressed={() => {
                    this.props.passMessage({ type: "switchTo", content: data });
                  }}
                />
              )
            )}
            <br />
            {this.generateProjectCards(
              "Invites",
              "You haven't been invited to any project",
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
            <br />
            <Card title="Debug Info">
              <pre>{formatJSON(this.state.user)}</pre>
            </Card>
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
