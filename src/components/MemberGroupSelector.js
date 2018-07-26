import React, { Component } from "react";
import { Select, Icon } from "antd";
import User from "../classes/User";

export default class MemberGroupSelector extends Component {
  static defaultProps = {
    onSelectionChanged: () => {}
  };
  state = {
    project: {},
    userInfo: {},
    roles: [],
    members: []
  };

  componentWillReceiveProps(props) {
    if (!props.project) return;
    if (
      props.project.projectID === this.state.project.projectID &&
      props.project.lastUpdatedTimestamp ===
        this.state.project.lastUpdatedTimestamp
    )
      return;
    this.setState({
      project: props.project
    });
    this.fetchUserInfo(props.project.members || []);
  }

  fetchUserInfo(members) {
    members.forEach(item => {
      User.get(item.uid).then(user => {
        this.setState({
          userInfo: Object.assign(this.state.userInfo, { [item.uid]: user })
        });
      });
    });
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
    this.setState({ roles, members });
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
                    {` ${item.name} (${
                      members.filter(member =>
                        member.roles.find(role => role === item.uid)
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
                      ? ` ${this.state.userInfo[item.uid].name}`
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
