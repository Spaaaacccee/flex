import React, { Component, useContext } from "react";

import PropTypes from 'prop-types';

import { Menu, Badge, Icon } from "antd";

import ProjectIcon from "./ProjectIcon";
import BrandIcon from "./BrandIcon";
import UserIcon from "./UserIcon";
import AddIcon from "./AddIcon";

import Project from "../classes/Project";
import Fetch from "../classes/Fetch";
import User from "../classes/User";
import update from "immutability-helper";
import $ from "../classes/Utils";
import Notifier from "../classes/Notifier";
import { Scrollbars } from "react-custom-scrollbars";
import Page, { SpecialPages, Pages } from "../classes/Page";

import { UserContext, ProjectContext } from "./Main";

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
 * Gets the notification count, which is simply the sum of messages and history events.
 * @param  {String} projectID 
 * @return 
 * @memberof ProjectNavigation
 */
const getNotificationCount = (projectID) => {
  return (0
    //Pages.messages || 0) +
    //((this.state.notificationCount[projectID] || {}).histories || 0)
  );
}

/**
 * A project navigation component, displays a list of ProjectIconItems
 * @export
 * @class ProjectNavigation
 * @extends Component
 */
export default function ProjectNavigation(props) {
  const { availableProjects, navigation } = props;
  const handlePress = (navigation) => {
    props.onNavigation && props.onNavigation(navigation);
  };
  const handleAddIconPress = () => {
    props.onAddIconPress && props.onAddIconPress();
  }

  const user = UserContext.use(this);
  const project = ProjectContext.use(this);

  return (
    <Scrollbars autoHide hideTracksWhenNotNeeded>
      {
        SpecialPages.map(page => {
          const thisNavigation = { type: "special", name: page.name };
          const isSelected = NavigationData.isEqual(navigation, thisNavigation);
          const notificationCount = isSelected ? 0 : page.getNotificationCount(project, user)
          return <div>
            <Badge
              offset={[0, 43]}
              style={{
                marginRight: 19
              }}
              count={notificationCount}
            >
              {page.getIcon && page.getIcon(user, project, isSelected, () => {
                handlePress(thisNavigation);
              })}
            </Badge>
          </div>
        })
      }
      <div style={{ borderBottom: "2px solid rgba(255,255,255,0.2)", width: 32, margin: "auto" }} />
      {
        // Display the list of projects.
        <Menu
          style={{
            background: "transparent",
            border: "none"
          }}
        >
          {availableProjects
            .filter(
              project =>
                !project.deleted
            )
            .map((project, index) => {
              const thisNavigation = { type: "project", projectID: project.projectID };
              const isSelected = NavigationData.isEqual(navigation, thisNavigation);
              const notificationCount = isSelected ? 0 : getNotificationCount(project)
              return <ProjectIcon
                notificationCount={notificationCount}
                key={index}
                name={project.name || null}
                onPress={() => {
                  handlePress(thisNavigation);
                }}
                selected={isSelected}
              />
            })}
          {<AddIcon onPress={handleAddIconPress.bind(this)} />}
        </Menu>
      }
    </Scrollbars>
  );
}

export class NavigationData {
  /**
   * Check if two navigation objects are equal
   * @param  {NavigationData} navA 
   * @param  {NavigationData} navB 
   * @return 
   * @memberof ProjectNavigation
   */
  static isEqual(navA, navB) {
    if (navA.type !== navB.type) return false;
    switch(navA.type) {
      case "project":
          return (navA.projectID === navB.projectID);
      case "special":
        return (navA.name === navB.name);
    }
    return true;
  }

  /**
   * @type {"special" | "project"}
   * @memberof NavigationData
   */
  type;
  /**
   * @type string
   * @memberof NavigationData
   */
  projectID;
  /**
   * @type {string}
   * @memberof NavigationData
   */
  name;
  /**
   * Creates an instance of NavigationData.
   * @param  {NavigationData} args 
   * @memberof NavigationData
   */
  constructor(args) {
    Object.assign(this, args);
  };
}