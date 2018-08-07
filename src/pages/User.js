import React, { Component } from "react";

import Fire from "../classes/Fire";

import UserIcon from "../components/UserIcon";

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
            <Card
              style={{
                textAlign: "center",
                background: "#1890FF",
                color: "#fff"
              }}
            >
              <UserIcon thumbnail={this.state.user.profilePhoto} />
              <b>{this.state.user.name || "Guest"}</b>
              <br />
              {this.state.user.email || "No email address"}
              <br />
              <br />
              <br />
              <Button
                ghost
                style={{
                  fontWeight: 500,
                  boxShadow:
                    "0px 4px 15px rgba(0, 0, 0, 0.09), 0px 1px 8px rgba(0, 0, 0, 0.05)"
                }}
                onClick={() => {
                  Fire.firebase()
                    .auth()
                    .signOut();
                  window.location.reload(true);
                }}
              >
                Sign Out
              </Button>
              <br />
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
                  <div style={{ fontWeight: 200, fontSize: 36 }}>
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
                  <div style={{ fontWeight: 200, fontSize: 36 }}>
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
                  <div style={{ fontWeight: 200, fontSize: 36 }}>
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
              "My Projects",
              "Create a project by selecting the + icon on the navigation bar.",
              this.state.user.projects,
              data => <ProjectDisplay />
            )}
            <br />
            {this.generateProjectCards(
              "Joined Projects",
              "You haven't joined any projects.",
              this.state.user.joinedProjects,
              data => <ProjectDisplay />
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
