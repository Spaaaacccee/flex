import React, { Component } from "react";

import Fire from "../classes/Fire";

import UserIcon from "../components/UserIcon";

import User from "../classes/User";

import { Button, Modal, Icon, Popconfirm, Badge } from "antd";
import { Card } from "antd";
import Project from "../classes/Project";
import { ObjectUtils } from "../classes/Utils";
import ProjectIcon from "../components/ProjectIcon";
import ProjectInvitation from "../components/ProjectInvitation";
import ProjectDisplay from "../components/ProjectDisplay";

export default class USER extends Component {
  state = {
    visible: false,
    user: undefined,
    caches: { pendingInvites: [] }
  };
  componentWillReceiveProps(props) {
    this.setState(
      {
        project: props.project,
        user: props.user
      },
      () => {
        if (this.state.user) {
          if (this.state.user.pendingInvites) {
            Promise.all(
              this.state.user.pendingInvites.map(item => Project.get(item))
            ).then(items => {
              this.setState(
                ObjectUtils.mergeDeep(this.state, {
                  caches: { pendingInvites: items }
                })
              );
            });
          }
          if (this.state.user.projects) {
            Promise.all(
              this.state.user.projects.map(item => Project.get(item))
            ).then(items => {
              this.setState(
                ObjectUtils.mergeDeep(this.state, {
                  caches: { projects: items }
                })
              );
            });
          }
          if (this.state.user.joinedProjects) {
            Promise.all(
              this.state.user.joinedProjects.map(item => Project.get(item))
            ).then(items => {
              this.setState(
                ObjectUtils.mergeDeep(this.state, {
                  caches: { joinedProjects: items }
                })
              );
            });
          }
        }
      }
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
                  fontWeight:500,
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
            <Card title="Projects">
              <div
                style={{
                  display: "flex"
                }}
              >
                {!!this.state.caches.projects &&
                !!this.state.caches.projects.length
                  ? this.state.caches.projects.map((item, index) => (
                      <div style={{ paddingRight: 20 }} key={index}>
                        <ProjectDisplay project={item} />
                      </div>
                    ))
                  : "You don't have any projects!"}
              </div>
            </Card>
            <br />
            <Card title="Joined Projects">
              <div
                style={{
                  display: "flex"
                }}
              >
                {!!this.state.caches.joinedProjects &&
                !!this.state.caches.joinedProjects.length
                  ? this.state.caches.joinedProjects.map((item, index) => (
                      <div style={{ paddingRight: 20 }} key={index}>
                        <ProjectDisplay project={item} />
                      </div>
                    ))
                  : "You haven't joined any projects!"}
              </div>
            </Card>
            <br />
            <Card title="Pending Invites">
              <div
                style={{
                  display: "flex"
                }}
              >
                {!!this.state.caches.pendingInvites &&
                !!this.state.caches.pendingInvites.length
                  ? this.state.caches.pendingInvites.map((item, index) => (
                      <div style={{ paddingRight: 20 }} key={index}>
                        {" "}
                        <Badge dot>
                          <ProjectInvitation
                            project={item}
                            onAcceptInvite={() => {
                              this.state.user.acceptInvite(item.projectID);
                            }}
                            onRejectInvite={() => {
                              this.state.user.rejectInvite(item.projectID);
                            }}
                          />
                        </Badge>
                      </div>
                    ))
                  : "You don't have any pending invites!"}
              </div>
            </Card>
            <br />
            <Card>
              <h2>Debug Info</h2>
              {JSON.stringify(this.state.user)}
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
