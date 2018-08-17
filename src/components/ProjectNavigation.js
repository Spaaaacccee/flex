import React, { Component } from "react";

import { Menu, Badge, Icon } from "antd";

import ProjectIcon from "./ProjectIcon";
import UserIcon from "./UserIcon";
import AddIcon from "./AddIcon";

import Firebase from "firebase";

import Project from "../classes/Project";
import Fetch from "../classes/Fetch";
import User from "../classes/User";
import update from "immutability-helper";
import $ from "../classes/Utils";

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
    openedIndex: -1,
    user: {},
    userData: {},
    projects: {},
    pauseUpdate: false
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  /**
   * Sync the state of the component with the properties.
   * @param  {Object} props Component properties
   * @return {void}
   * @memberof ProjectNavigation
   */
  componentWillReceiveProps(props) {
    this.getProjects(props.items);
    this.setState(
      {
        openedProject: props.openedProject,
        items: props.items,
        user: props.user,
        openedIndex: props.openedProject
          ? props.items.indexOf(props.openedProject)
          : -1
      },
      () => {
        User.getCurrentUser().then(user => {
          this.setState({ userData: user });
        });
      }
    );
  }

  getProjects(items) {
    items.forEach(projectID => {
      if (!this.state.projects[projectID]) {
        Fetch.getProjectReference(projectID)
          .child("name")
          .on("value", snapshot => {
            this.setState({
              projects: Object.assign(this.state.projects, {
                [projectID]: snapshot.val()
              })
            });
          });
      }
    });
    this.state.items.forEach(projectID => {
      if (!$.array(items).exists(projectID)) {
        Fetch.getProjectReference(projectID)
          .child("name")
          .off();
      }
    });
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
        {this.state.items ? (
          <Menu
            style={{
              height: "100%",
              background: "transparent",
              border: "none"
            }}
          >
            {this.state.items
              .filter(
                item =>
                  !this.state.projects[item] ||
                  !this.state.projects[item].deleted
              )
              .map((item, index) => (
                <ProjectIcon
                  key={item}
                  name={this.state.projects[item] || null}
                  onPress={
                    this.state.projects[item]
                      ? this.handlePress.bind(this, index)
                      : () => {}
                  }
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
