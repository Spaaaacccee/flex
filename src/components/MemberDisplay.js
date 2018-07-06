import React, { Component } from "react";
import { List, Icon, Card, Avatar, Popover, Button } from "antd";
import User from "../classes/User";
import Project from "../classes/Project";
import { ArrayUtils } from "../classes/Utils";

export default class MemberDisplay extends Component {
  state = {
    member: {},
    project: {},
    userInfo: {},
    roleInfo: {}
  };

  componentWillReceiveProps(props) {
    this.setState(
      {
        member: props.member,
        project: props.project
      },
      () => {
        User.get(this.state.member.uid).then(user => {
          this.setState({ userInfo: user });
        });
        Project.get(this.state.project.projectID).then(project => {
          this.setState({
            roleInfo: (() => {
              let collection = {};
              let userRoles = this.state.member.roles || [];
              userRoles.forEach(element => {
                collection[element] = project.roles.filter(
                  item => item.uid === element
                );
              });
              return collection;
            })()
          });
        });
      }
    );
  }

  render() {
    return (
      //<div>{this.state.userInfo.name||'...'}, {}, {this.state.userInfo.uid === this.state.project.owner ? <Icon type="star" />:''}</div>
      <div>
        <Card style={{ textAlign: "left" }}>
          <Card.Meta
            avatar={<Avatar src={this.state.userInfo.profilePhoto} />}
            title={
              <div>
                {this.state.userInfo.name || <Icon type="loading" />}{" "}
                {this.state.userInfo.uid === this.state.project.owner ? (
                  <Popover content="Owner">
                    <Icon type="star" />
                  </Popover>
                ) : (
                  ""
                )}
              </div>
            }
            description={(() => {
              let roleNames = [];
              for (let prop in this.state.roleInfo) {
                roleNames.push(prop.name);
              }
              return (
                <div>
                  {roleNames.join(", ") || <i>No roles</i>}{" "}
                  {
                    <Popover content="Edit tags">
                      <Button shape="circle" icon="tags" onClick={() => {}} />
                    </Popover>
                  }
                </div>
              );
            })()}
          />
        </Card>
      </div>
    );
  }
}
