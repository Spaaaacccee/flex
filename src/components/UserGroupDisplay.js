import React, { Component } from "react";
import { Tag, Icon } from "antd";
import User from "../classes/User";
import Project from "../classes/Project";

export default class UserGroupDisplay extends Component {
  state = {
    people: {members:[],roles:[]},
    roleInfo: [],
    userInfo: [],
    project: {},
    style: {}
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({style:props.style})
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

  shouldComponentUpdate(props, state) {
    if(state.roleInfo !== this.state.roleInfo) return true;
    if(state.userInfo !== this.state.userInfo) return true;
    if(JSON.stringify(props.people) !== JSON.stringify(this.state.people)) return true;
    if(!Project.equal(props.project,this.state.project)) return true;
    return false;
  }
  render() {
    return (
      <div style={this.state.style}>
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
              {item.name.slice(0, 15) === item.name
                ? item.name
                : `${item.name.slice(0, 15)}...`}
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
