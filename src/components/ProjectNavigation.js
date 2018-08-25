import React, { Component } from "react";

import { Menu, Badge, Icon } from "antd";

import ProjectIcon from "./ProjectIcon";
import UserIcon from "./UserIcon";
import AddIcon from "./AddIcon";

import Project from "../classes/Project";
import Fetch from "../classes/Fetch";
import User from "../classes/User";
import update from "immutability-helper";
import $ from "../classes/Utils";
import Notifier from "../classes/Notifier";
import {Scrollbars} from "react-custom-scrollbars";

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
    passMessage: () => {},
    items: []
  };

  state = {
    items: [], // The project IDs of the projects to display.
    openedProject: null, // The opened project.
    openedIndex: -1, // The index of the currently opened item.
    user: {}, // Data about the user, from the auth source.
    userData: {}, // Data about the user, from the database.
    projects: {}, // The projects to display.
    notificationCount: {}, // A dictionary of notification counts.
    pauseUpdate: false // Whether to temporarily stop updating.
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
    // If the new properties contain items, then set the new items.
    if (props.items.length) {
      Notifier.setProjects(props.items);
    }
    // Create a copy of the old items.
    let oldItems = this.state.items.slice();

    // Update the state with new properties.
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

        // Get the project info.
        this.getProjects(props.items, oldItems, props.user.uid);

        // Get the user info.
        User.getCurrentUser().then(user => {
          this.setState({ userData: user });
        });
      }
    );
  }

  shouldComponentUpdate(props, state) {
    if (props.items !== this.state.items) return true;
    if (this.state.projects !== state.projects) return true;
    if (props.openedProject !== this.state.openedProject) return true;
    if ((props.user || {}).uid !== (this.state.user || {}).uid) return true;
    if (this.state.openedIndex !== state.openedIndex) return true;
    if (!User.equal(state.userData, this.state.userData)) return true;
    if (state.projects !== this.state.projects) return true;
    if (state.notificationCount !== this.state.notificationCount) return true;
    // Don't update this component is no properties have changed.
    return false;
  }

  /**
   * Gets the notification count, which is simply the sum of messages and history events.
   * @param  {String} projectID 
   * @return 
   * @memberof ProjectNavigation
   */
  getNotificationCount(projectID) {
    return (
      ((this.state.notificationCount[projectID] || {}).messages || 0) +
      ((this.state.notificationCount[projectID] || {}).histories || 0)
    );
  }

  /**
   * Get information about new projects.
   * @param  {String[]} newItems 
   * @param  {String[]} oldItems 
   * @param  {String} userID 
   * @return {void}
   * @memberof ProjectNavigation
   */
  getProjects(newItems, oldItems, userID) {
    // For each new item, add a message and history event listener if an existing one doesn't exist.
    newItems.forEach(projectID => {
      if (!oldItems.find(x=>x===projectID)) {
        // Define a messages listener, to update the messages count.
        Project.get(projectID).then(project => {
          Fetch.getMessagesReference(project.messengerID || project.projectID)
            .child("messages")
            .on("value", snapshot => {
              if (!this.state.items.find(x => x === project.projectID)) {
                snapshot.ref.off();
                return;
              }
              let messagesCount = (
                $.object(snapshot.val() || {}).values() || []
              ).filter(x => x.content && !(x.readBy || {})[userID]).length;
              if (
                messagesCount !==
                (this.state.notificationCount[projectID] || {}).messages
              ) {
                this.setState(
                  update(this.state, {
                    notificationCount: {
                      [projectID]: {
                        $set: {
                          ...(this.state.notificationCount[projectID] || {}),
                          messages: messagesCount
                        }
                      }
                    }
                  })
                );
              }
            });
        });
        // Define a project listener, to update the project name and notification count.
        let projectCallback = snapshot => {
          if (!this.state.items.find(x => x === projectID))
            snapshot.ref.off("value", projectCallback);
          let project = snapshot.val();
          if (!project) return;
          if (
            project.deleted &&
            this.state.openedProject === project.projectID
          ) {
            this.props.onMessage({ type: "switchTo", content: null });
            snapshot.ref.off("value", projectCallback);
          }
          let histories = (project.history || []).filter(
            x => !(x.readBy || {})[userID]
          ).length;
          this.setState({
            notificationCount: update(this.state.notificationCount || {}, {
              [projectID]: {
                $set: {
                  ...(this.state.notificationCount[projectID] || {}),
                  histories
                }
              }
            }),
            projects: update(this.state.projects, {
              [projectID]: { $set: project.name }
            })
          });
        };
        // Attach the project listener.
        Fetch.getProjectReference(projectID).on("value", projectCallback);
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
      <Scrollbars autoHide hideTracksWhenNotNeeded>
        <Badge
          offset={[15, 15]}
          count={
            !!this.state.userData && !!this.state.userData.pendingInvites
              ? this.state.userData.pendingInvites.length
              : 0
          }
        > 
          {/* Display a user icon. */}
          <UserIcon
            thumbnail={this.state.user ? this.state.user.photoURL : ""}
            onPress={this.handleUserProfilePress.bind(this)}
            selected={this.state.openedIndex === -1}
          />
        </Badge>
        {this.state.items ? (
          // Display the list of projects.
          <Menu
            style={{
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
                  notificationCount={
                    index === this.state.openedIndex
                      ? 0
                      : this.getNotificationCount(item)
                  }
                  key={item}
                  name={this.state.projects[item] || null}
                  onPress={this.handlePress.bind(this, index)}
                  selected={index === this.state.openedIndex}
                />
              ))}
            {<AddIcon onPress={this.handleAddIconPress.bind(this)} />}
          </Menu>
        ) : (
          <ProjectIcon icon={"loading"} />
        )}
      </Scrollbars>
    );
  }
}
