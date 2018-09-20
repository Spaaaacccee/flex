import React, { Component } from "react";
import { Select, Icon } from "antd";
import User from "../classes/User";
import update from "immutability-helper";

/**
 * A component that allows selection of a user's roles.
 * @export
 * @class MemberGroupSelector
 * @extends Component
 */
export default class MemberGroupSelector extends Component {
  static defaultProps = {
    onSelectionChanged: () => {}
  };
  state = {
    project: {}, // The project to get the roles from.
    userInfo: {}, // Information about the associated users.
    roles: [], // The roles that are picked.
    members: [], // The members of the project.
    values: [] // The selected people.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // If no project is supplied, then don't change anything.
    if (!props.project) return;
    // Set the project.
    this.setState({
      project: props.project
    });

    // Get user information of the listed members.
    this.fetchUserInfo(props.project.members || []).then(() => {
      if (props.values) {
        let members = props.values.members || [];
        let roles = props.values.roles || [];
        // Encode the name of each of the users nd roles into a string.
        // For every member, their name will be prepended by an M
        // for every role, their name will be prepended by an R
        // Then, their ID, and name is added.
        // e.g. "M:2189yiF32hrUOsHasf12:Alex Jones"
        // Each value is separated by colons. Colons should not appear in any part of their names of IDs
        this.setState({
          values: [
            ...members.map(x => `M:${x}:${this.state.userInfo[x].name}`),
            ...roles
              .map(x => {
                let role = this.state.project.roles.find(i => i.uid === x);
                return role ? `R:${x}:${role.name}` : null;
              })
              .filter(x => x)
          ]
        });
      }
    });
  }

  /**
   * Set the selelected people.
   * @param  {any} values
   * @return {void}
   * @memberof MemberGroupSelector
   */
  setValues(values) {
    this.componentWillReceiveProps(update(this.props, { values: { $set: values } }));
  }

  /**
   * Get the user info of all supplied members
   * @param  {String[]} members
   * @return {void}
   * @memberof MemberGroupSelector
   */
  async fetchUserInfo(members) {
    await Promise.all(
      members.map(async item => {
        // Create a promise that gets resolved as soon as the information about the user has become available.
        return new Promise(res => {
          // If there is already information about the user, then return.
          if (this.state.userInfo[item.uid]) {
            res();
            return;
          }

          // Otherwise, get the user information.
          User.get(item.uid).then(user => {
            this.setState(
              {
                // Set the user information.
                userInfo: Object.assign(this.state.userInfo, {
                  [item.uid]: user
                })
              },
              () => {
                // Finish and resolve.
                res();
              }
            );
          });
        });
      })
    );
  }

  /**
   * What to do when the selected people have changed.
   * @param  {any} values
   * @return {void}
   * @memberof MemberGroupSelector
   */
  selectionChanged(values) {
    values = values || [];
    let roles = [],
      members = [];

    // For every selected people, record their IDs
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
    // Set, and notify the parent component of the newly selected people.
    this.setState({ roles, members, values });
    this.props.onSelectionChanged({ roles, members });
  }

  render() {
    let roles = this.state.project.roles || [];
    let members = this.state.project.members || [];
    return (
      <div>
        {/* The dropdown component, */}
        <Select
          dropdownMatchSelectWidth={false}
          style={{ minWidth: 200, maxWidth: "100%" }}
          mode="multiple"
          onChange={this.selectionChanged.bind(this)}
          value={this.state.values}
        >
          {roles.length && (
            // Display all roles.
            <Select.OptGroup label="Roles">
              {roles.map(item => (
                <Select.Option key={item.uid} value={`R:${item.uid}:${item.name}`}>
                  <div>
                    <Icon type="tag" theme="filled"/>
                    {/* Trim the name of the role if it's too long */}
                    {` ${item.name.slice(0, 15) === item.name ? item.name : `${item.name.slice(0, 15)}...`} (${
                      members.filter(member => (member.roles || []).find(role => role === item.uid)).length
                    } members)`}
                  </div>
                </Select.Option>
              ))}
            </Select.OptGroup>
          )}
          {members.length && (
            <Select.OptGroup label="Members">
              {members.map(item => (
                // Display all users.
                <Select.Option
                  key={item.uid}
                  value={`M:${item.uid}:${this.state.userInfo[item.uid] ? `${this.state.userInfo[item.uid].name}` : ""}`}
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
