import React, { Component } from "react";
import propTypes from "prop-types";

import { Menu } from "antd";

import ProjectIcon from "./ProjectIcon";
import UserIcon from "./UserIcon";
import AddIcon from "./AddIcon";

import Firebase from "firebase";

import Project from "../classes/Project";
import Fetch from "../classes/Fetch";

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
  static propTypes = {
    onProjectChanged: propTypes.func,
    onAddIconPress: propTypes.func,
    onUserProfilePress: propTypes.func,
    items: propTypes.arrayOf(propTypes.instanceOf(ProjectIconItem))
  };

  static defaultProps = {
    onProjectChanged: () => {},
    onAddIconPress: () => {},
    onUserProfilePress: () => {},
    items: []
  };

  state = {
    items: [],
    openedProject: undefined,
    openedIndex: undefined,
    user: null,
    projects: []
  };

  /**
   * Sync the state of the component with the properties.
   * @param  {Object} props Component properties
   * @return {void}
   * @memberof ProjectNavigation
   */
  componentWillReceiveProps(props) {
    this.setState(
      {
        items: props.items,
        user: props.user
      },
      () => {
        this.getProjects().then(() => {
          // If there are items in the collection, and no items are currently selected, select the first one
          if (
            this.state.items.length &&
            typeof this.state.openedIndex === "undefined"
          )
            this.handlePress(0);
        });
      }
    );
  }

  async getProjects() {
    this.setState({
      projects: await Promise.all(
        this.state.items
          .map(item => {
            try {
              return Project.get(item);
            } catch (e) {
              console.log(e);
              return null;
            }
          })
          .filter(item => item !== null)
      )
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
        <Menu style={{ height: "100vh", background: "hsla(216, 20%, 97%, 1)" }}>
          {
            <UserIcon
              thumbnail={this.state.user ? this.state.user.photoURL : ""}
              onPress={this.handleUserProfilePress.bind(this)}
              selected={this.state.openedIndex === -1}
            />
          }
          {//let array = []; //Firebase.database().ref();
          this.state.projects.map((item, index) => {
            return (
              <ProjectIcon
                key={index}
                name={item.name}
                thumbnail={item.thumbnail}
                onPress={this.handlePress.bind(this, index)}
                selected={index === this.state.openedIndex}
              />
            );
          })}
          {<AddIcon onPress={this.handleAddIconPress.bind(this)} />}
        </Menu>
      </div>
    );
  }
}
