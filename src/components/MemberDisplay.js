import React, { Component } from "react";
import { List, Icon, Card, Avatar, Popover, Button } from "antd";
import User from "../classes/User";
import Project from "../classes/Project";
import { ArrayUtils } from "../classes/Utils";
import RolePicker from "./RolePicker";

export default class MemberDisplay extends Component {
  state = {
    member: {},
    project: {},
    userInfo: {},
    roleInfo: {},
    roles: [],
    availableRoles: []
  };

  componentWillReceiveProps(props) {
    if (
      props.member.uid === this.state.member.uid &&
      props.project.projectID === this.state.project.projectID &&
      props.project.lastUpdatedTimestamp ===
        this.state.project.lastUpdatedTimestamp
    )
      return;
    this.setState(
      {
        member: props.member,
        project: props.project
      },
      () => {
        User.get(this.state.member.uid).then(user => {
          this.setState({ userInfo: user });
        });
        this.setState(
          {
            roleInfo: (() => {
              let collection = {};
              let userRoles = this.state.member.roles || [];
              userRoles.forEach(element => {
                collection[element] = this.state.project.roles.filter(
                  item => item.uid === element
                )[0];
              });
              return collection;
            })()
          },
          () => {
            this.setState({
              availableRoles: this.state.project.roles,
              roles: (() => {
                let roles = [];
                for (let prop in this.state.roleInfo) {
                  roles.push(this.state.roleInfo[prop]);
                }
                roles = roles.filter(item => !!item);
                return roles;
              })()
            });
          }
        );
      }
    );
  }

  render() {
    return (
      <div>
        <Card style={{ textAlign: "left" }}>
          <Card.Meta
            avatar={<Avatar src={this.state.userInfo.profilePhoto} />}
            title={
              <div>
                {this.state.userInfo.name || <Icon type="loading" />}{" "}
                {this.state.userInfo.uid &&
                  this.state.userInfo.uid === this.state.project.owner && (
                    <Popover content="Owner">
                      <Icon type="star" />
                    </Popover>
                  )}
              </div>
            }
            description={
              <div>
                {this.state.userInfo.email || <Icon type="loading" />}
                <br />
                <br />
                <RolePicker
                  roles={this.state.roles}
                  availableRoles={this.state.availableRoles}
                  onRolesChange={roles => {
                    this.setState({ roles }, () => {
                      this.state.project.setMember(
                        this.state.member.uid,
                        ArrayUtils.select(roles, item => item.uid)
                      );
                    });
                  }}
                />
              </div>
            }
          />
        </Card>
        <br />
      </div>
    );
  }
}
