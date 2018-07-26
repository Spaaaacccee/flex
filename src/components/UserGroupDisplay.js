import React, { Component } from "react";
import { Tag, Icon } from "antd";
import User from "../classes/User";

export default class UserGroupDisplay extends Component {
  state = {
    people: {},
    roleInfo: [],
    userInfo: [],
    project: {}
  };
  componentWillReceiveProps(props) {
    let people = props.people || {};
    let project = props.project || {};
    this.setState({ people, project });
    if (people.members) {
      Promise.all(people.members.map(user => User.get(user))).then(userInfo => {
        this.setState({ userInfo });
      });
    }
    if (people.roles && project) {
      this.setState({
        roleInfo: people.roles
          .map(role => (project.roles || []).find(item => role === item.uid))
          .filter(item => item)
      });
    }
  }
  render() {
    return (
      <div>
        {this.state.roleInfo
          .map((item, index) => (
            <Tag
              color={`hsl(${item.color.hue},${item.color.saturation}%,${
                item.color.lightness
              }%)`}
              key={"R:" + index}
            >
              {<Icon type="tags" />}
              {` `}
              {item.name}
            </Tag>
          ))
          .concat(
            this.state.userInfo.map((item, index) => (
              <Tag key={"U:" + index}>
                {<Icon type="user" />}
                {` `}
                {item.name}
              </Tag>
            ))
          )}
      </div>
    );
  }
}
