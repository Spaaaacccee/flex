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

export default class Page_User extends Component {
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
        }
      }
    );
  }
  render() {
    return (
      <div style={{ textAlign: "left" }}>
        {this.state.user ? (
          <div>
            <Card style={{ textAlign: "center" }}>
              <UserIcon thumbnail={this.state.user.profilePhoto} />
              <b>{this.state.user.name || "Guest"}</b>
              <br />
              {this.state.user.email || "No email address"}
              <br />
              <br />
              <br />
              <Button
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
              <div style={{display:'flex',alignItems:'center', justifyContent:'center'}}>
                <div style={{
                  margin:'0 2.5vw',
                  textAlign:'center'
                }}>
                  <div style={{ fontWeight: 200, fontSize: 36 }}>
                    {this.state.user.projects ? this.state.user.projects.length : 0}
                  </div>
                  <p>Projects</p>
                </div>
                <div style={{
                  margin:'0 2.5vw',
                  textAlign:'center'
                }}>
                  <div style={{ fontWeight: 200, fontSize: 36 }}>
                    {this.state.user.joinedProjects ? this.state.user.joinedProjects.length : 0}
                  </div>
                  <p>Joined Projects</p>
                </div>
                <div style={{
                  margin:'0 2.5vw',
                  textAlign:'center'
                }}>
                  <div style={{ fontWeight: 200, fontSize: 36 }}>
                    {this.state.user.pendingInvites ? this.state.user.pendingInvites.length : 0}
                  </div>
                  <p>Invites</p>
                </div>
              </div>
            </Card>
            <br />
            <Card>
              <h2>Projects</h2>
              <p>Not implemented yet</p>
            </Card>
            <br />
            <Card>
              <h2>Joined Projects</h2>
              <p>Not implemented yet</p>
            </Card>
            <br />
            <Card>
              <Badge
                dot={
                  !!this.state.caches.pendingInvites &&
                  !!this.state.caches.pendingInvites.length
                }
              >
                <h2>Pending Invites</h2>
              </Badge>
              <br />
              {!!this.state.caches.pendingInvites &&
              !!this.state.caches.pendingInvites.length
                ? this.state.caches.pendingInvites.map((item, index) => (
                    <ProjectInvitation
                      project={item}
                      key={index}
                      onAcceptInvite={() => {
                        this.state.user.acceptInvite(item.projectID);
                      }}
                      onRejectInvite={() => {
                        this.state.user.rejectInvite(item.projectID);
                      }}
                    />
                  ))
                : "You don't have any pending invites!"}
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
