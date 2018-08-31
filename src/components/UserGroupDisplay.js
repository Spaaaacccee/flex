import React, { Component } from "react";
import { Tag, Icon, Popover } from "antd";
import User from "../classes/User";
import Project from "../classes/Project";
import shallowEqualArrays from "shallow-equal/arrays";
import MemberDisplay from "./MemberDisplay";
import { HSL } from "../classes/Role";

/**
 * Displays a group of people.
 * @export
 * @class UserGroupDisplay
 * @extends Component
 */
export default class UserGroupDisplay extends Component {
  /**
   * Returns whether a list of people contains a specific user.
   * @static
   * @param  {{members:String[], roles: String[]}} people
   * @param  {Project} project
   * @param  {User} user
   * @return
   * @memberof UserGroupDisplay
   */
  static hasUser(people, project, user) {
    // If any of the supplied information is empty, return false.
    if (!user.uid) return false;
    if (!project.projectID) return false;
    if (!people) return false;

    // If the member can be found in the list of members, then return true.
    if ((people.members || []).find(memberID => memberID === user.uid)) return true;

    // If the member can be found in the list of roles, then return true.
    if (
      (people.roles || []).find(role =>
        ((project.members || []).find(memberID => memberID.uid === user.uid).roles || []).find(roleID => roleID === role)
      )
    )
      return true;
    // Otherwise return false.
    return false;
  }

  static defaultProps = {
    people: { members: [], roles: [] },
    project: {}
  };

  state = {
    people: { members: [], roles: [] }, // The people to display.
    roleInfo: [], // The information about the roles to display.
    userInfo: [], // The information about the users to display.
    project: {}, // The project to get the roles from.
    style: {} // Extra styles to apply to the component.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Apply the extra styles.
    this.setState({ style: props.style || {} });
    let people = props.people || {};
    let project = props.project || {};
    this.setState({ people, project });
    if (people.members) {
      // Get the information for every user.
      Promise.all(people.members.map(user => User.get(user))).then(userInfo => {
        this.setState({ userInfo });
      });
    }
    if (people.roles && project) {
      // Get the information for every role.
      this.setState({
        roleInfo: people.roles.map(role => (project.roles || []).find(item => role === item.uid)).filter(item => item)
      });
    }
  }

  shouldComponentUpdate(props, state) {
    if (!shallowEqualArrays(state.roleInfo || [], this.state.roleInfo || [])) return true;
    if (!shallowEqualArrays(state.userInfo || [], this.state.userInfo || [])) return true;
    if (!Project.equal(props.project, this.state.project)) return true;
    // If no properties have changed, then don't update anything.
    return false;
  }

  render() {
    return (
      <div style={this.state.style}>
        {/* If there's any people to display, prepend it with the children of this component. This is useful for including a line break, before the list of people. */}
        {!!((this.state.people.members || []).length + (this.state.people.roles || []).length) && this.props.children}
        {this.state.roleInfo
          .map((item, index) => (
            // Display every role.
            <Popover
              key={"R:" + index}
              placement="rightTop"
              trigger="click"
              content={
                this.state.project &&
                this.state.project.members &&
                this.state.project.members.filter(x => (x.roles || []).find(role => role === item.uid)).length ? (
                  <UserGroupDisplay
                    project={this.state.project}
                    people={{
                      members: this.state.project.members
                        .filter(x => (x.roles || []).find(role => role === item.uid))
                        .map(x => x.uid)
                    }}
                  />
                ) : (
                  <span>
                    <Icon type="tags" />
                    {" No one has this role."}
                  </span>
                )
              }
            >
              <Tag color={HSL.toCSSColour(item.color)}>
                {<Icon type="tags" />} {item.name.slice(0, 15) === item.name ? item.name : `${item.name.slice(0, 15)}...`}
              </Tag>
            </Popover>
          ))
          .concat(
            this.state.userInfo.map((item, index) => (
              // Use a popover to display information about the user when clicked.
              <Popover
                placement="rightTop"
                trigger="click"
                key={"U:" + index}
                content={
                  this.state.project &&
                  this.state.project.members &&
                  this.state.project.members.find(x => x.uid === item.uid) ? (
                    <div style={{ minWidth: 200 }}>
                      <MemberDisplay
                        member={this.state.project.members.find(x => x.uid === item.uid)}
                        project={this.state.project}
                        readOnly
                        cardless
                      />
                    </div>
                  ) : (
                    <span>
                      {(item || {}).name || <Icon type="loading" />}
                      {" has left this project."}
                    </span>
                  )
                }
              >
                {/* Display every user. */}
                <Tag>
                  {<Icon type="user" />} {item.name}
                </Tag>
              </Popover>
            ))
          )}
        {Array.apply(
          null,
          Array(Math.max((this.state.people.members || []).length - (this.state.userInfo || []).length, 0))
        ).map((x, i) => (
          // Display a placeholder for every user that has yet to load.
          <Tag key={i}>
            <Icon type="user" /> <Icon type="loading" />
          </Tag>
        ))}
        {Array.apply(
          null,
          Array(
            Math.max(
              (this.state.people.roles || []).filter(x => this.state.project.roles.find(role => role.uid === x)).length -
                (this.state.roleInfo || []).length,
              0
            )
          )
        ).map((x, i) => (
          // Display a placeholder for every role that has yet to load.
          <Tag key={i}>
            <Icon type="tags" /> <Icon type="loading" />
          </Tag>
        ))}
      </div>
    );
  }
}
