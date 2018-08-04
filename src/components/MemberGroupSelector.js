import React, { Component } from "react";
import { Select, Icon } from "antd";
import User from "../classes/User";
import Project from "../classes/Project";

export default class MemberGroupSelector extends Component {
  static defaultProps = {
    onSelectionChanged: () => {}
  };
  state = {
    project: {},
    userInfo: {},
    roles: [],
    members: [],
    values: []
  };

  componentWillReceiveProps(props) {
    if (!props.project) return;
    this.setState({
      project: props.project
    });
    this.fetchUserInfo(props.project.members || []).then(() => {
      if (props.values) {
        let members = props.values.members || [];
        let roles = props.values.roles || [];
        this.setState({
          values: [
            ...members.map(x => `M:${x}:${this.state.userInfo[x].name}`),
            ...roles.map(
              x =>
                `R:${x}:${this.state.project.roles.find(i => i.uid === x).name}`
            )
          ]
        });
      }
    });
  }

  async fetchUserInfo(members) {
    await Promise.all(
      members.map(item => {
        return new Promise((res, rej) => {
          if (this.state.userInfo[item.uid]) {
            res();
            return;
          }
          User.get(item.uid).then(user => {
            this.setState(
              {
                userInfo: Object.assign(this.state.userInfo, {
                  [item.uid]: user
                })
              },
              () => {
                res();
              }
            );
          });
        });
      })
    );
  }

  selectionChanged(values) {
    values = values || [];
    let roles = [],
      members = [];
    values.forEach(item => {
      let substrings = item.split(":");
      switch (substrings[0]) {
        case "R":
          roles.push(substrings[1]);
          break;
        case "M":
          members.push(substrings[1]);
          break;
        default:
          break;
      }
    });
    this.setState({ roles, members, values });
    this.props.onSelectionChanged({ roles, members });
  }

  render() {
    let roles = this.state.project.roles || [];
    let members = this.state.project.members || [];
    let userInfo = this.state.userInfo;
    return (
      <div>
        <Select
          dropdownMatchSelectWidth={false}
          style={{ minWidth: 200, maxWidth: "100%" }}
          mode="multiple"
          onChange={this.selectionChanged.bind(this)}
          value={this.state.values}
        >
          {roles.length && (
            <Select.OptGroup label="Roles">
              {roles.map((item, index) => (
                <Select.Option
                  key={item.uid}
                  value={`R:${item.uid}:${item.name}`}
                >
                  <div>
                    <Icon type="tags" />
                    {` ${
                      item.name.slice(0, 15) === item.name
                        ? item.name
                        : `${item.name.slice(0, 15)}...`
                    } (${
                      members.filter(member =>
                        (member.roles || []).find(role => role === item.uid)
                      ).length
                    } members)`}
                  </div>
                </Select.Option>
              ))}
            </Select.OptGroup>
          )}
          {members.length && (
            <Select.OptGroup label="Members">
              {members.map((item, index) => (
                <Select.Option
                  key={item.uid}
                  value={`M:${item.uid}:${
                    this.state.userInfo[item.uid]
                      ? `${this.state.userInfo[item.uid].name}`
                      : ""
                  }`}
                >
                  <div>
                    <Icon type="user" />
                    {this.state.userInfo[item.uid] ? (
                      ` ${this.state.userInfo[item.uid].name}`
                    ) : (
                      <span>
                        {" "}
                        <Icon type="loading" />
                      </span>
                    )}
                  </div>
                </Select.Option>
              ))}
            </Select.OptGroup>
          )}
        </Select>
      </div>
    );
  }
}
