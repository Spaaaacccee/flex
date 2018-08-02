import React, { Component } from "react";

import { Menu, Badge, Icon } from "antd";

import ProjectIcon from "./ProjectIcon";
import UserIcon from "./UserIcon";
import AddIcon from "./AddIcon";

import Firebase from "firebase";

import Project from "../classes/Project";
import Fetch from "../classes/Fetch";
import User from "../classes/User";

/**
 * Represents a single item that can be displayed by the project navigation sidebar
 * @class ProjectIconItem
 */
class ProjectIconItem {
  name;
  thumbnail;
  projectID;
  /**
   * Creates an instance of ProjectIconItem.
   * @param  {String} name The user-friendly name of the item
   * @param  {String} thumbnail A link to an image or base64 encoded image to use as a thumbnail
   * @param  {String} projectID The project ID of the item
   * @memberof ProjectIconItem
   */
  constructor(name, thumbnail, projectID) {
    this.name = name;
    this.thumbnail = thumbnail;
    this.projectID = projectID;
  }
}

/**
 * Args for when the item selection has changed
 * @class itemChangedArgs
 */
class itemChangedArgs {
  item;
  index;
  /**
   * Creates an instance of itemChangedArgs.
   * @param  {any} item The ProjectIconItem that was selected
   * @param  {any} index The index of the item that was selected
   * @memberof itemChangedArgs
   */
  constructor(item, index) {
    this.item = item;
    this.index = index;
  }
}

/**
 * A project navigation component, displays a list of ProjectIconItems
 * @export
 * @class ProjectNavigation
 * @extends Component
 */
export default class ProjectNavigation extends Component {
  static defaultProps = {
    onProjectChanged: () => {},
    onAddIconPress: () => {},
    onUserProfilePress: () => {},
    items: []
  };

  state = {
    items: [],
    openedProject: null,
    openedIndex: null,
    user: {},
    userData: {},
    projects: null,
    pauseUpdate: false
  };

  /**
   * Sync the state of the component with the properties.
   * @param  {Object} props Component properties
   * @return {void}
   * @memberof ProjectNavigation
   */
  componentWillReceiveProps(props) {
    if (props.pauseUpdate) {
      this.setState({ pauseUpdate: props.pauseUpdate });
    }
    this.setState(
      {
        items: props.items,
        user: props.user
      },
      () => {
        this.getProjects();
        User.getCurrentUser().then(user => {
          this.setState({ userData: user });
        });
      }
    );
  }

  shouldComponentUpdate(nextProps) {
    return !nextProps.pauseUpdate;
  }

  getProjects() {
    Promise.all(
      this.state.items.map(item => {
        try {
          return Project.get(item);
        } catch (e) {
          console.log(e);
          return null;
        }
      })
    ).then((projects)=>{
      this.setState({
        projects
      });
    })

  }

  /**
   * Respond to when an item from the navigation sidebar is pressed
   * @param  {Integer} index The index of the pressed item
   * @return {void}
   * @memberof ProjectNavigation
   */
  handlePress(index) {
    // Set internal state
    this.setState({
      openedProject: this.state.items[index],
      openedIndex: index
    });

    // Notify the parent element
    this.props.onProjectChanged(
      new itemChangedArgs(this.state.items[index], index)
    );
  }

  /**
   * Respond to when the user icon is pressed
   * @return {void}
   * @memberof ProjectNavigation
   */
  handleUserProfilePress() {
    this.setState({
      openedProject: this.state.userPage,
      openedIndex: -1
    });
    this.props.onUserProfilePress();
  }

  handleAddIconPress() {
    this.props.onAddIconPress();
  }

  render() {
    return (
      <div>
        <Badge
          offset={[15, 15]}
          count={
            !!this.state.userData && !!this.state.userData.pendingInvites
              ? this.state.userData.pendingInvites.length
              : 0
          }
        >
          <UserIcon
            thumbnail={this.state.user ? this.state.user.photoURL : ""}
            onPress={this.handleUserProfilePress.bind(this)}
            selected={this.state.openedIndex === -1}
          />
        </Badge>
        {this.state.projects ? (
          <Menu
            style={{
              height: "100%",
              background: "transparent",
              border: "none"
            }}
          >
            {this.state.projects.map((item, index) => (
              <ProjectIcon
                key={index}
                name={item ? item.name : null}
                icon={item ? null : "loading"}
                thumbnail={item ? item.thumbnail : null}
                onPress={item ? this.handlePress.bind(this, index) : () => {}}
                selected={index === this.state.openedIndex}
              />
            ))}
            {<AddIcon onPress={this.handleAddIconPress.bind(this)} />}
          </Menu>
        ) : (
          <ProjectIcon icon={"loading"} />
        )}
      </div>
    );
  }
}
