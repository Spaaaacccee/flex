import React from "react";

import $ from "./Utils";

import { Icon } from "antd";
import BrandIcon from "../components/BrandIcon";
import UserIcon from "../components/UserIcon";

import HOME from "../pages/Home";
import MEMBERS from "../pages/Members";
import FEED from "../pages/Feed";
import TIMELINE from "../pages/Timeline";
import FILES from "../pages/Files";
import MESSAGES from "../pages/Messages";
import USER from "../pages/User";

/**
 * Represents a single page that can be displayed within the app.
 * @export
 * @class Page
 */
export default class Page {
  static equal(a, b) {
    return a && b && a.name === b.name;
  }

  /**
   * The name of the page. This will also be displayed as the name of the associated menu item button.
   * @type {String}
   * @memberof Page
   */
  name;
  /**
   * An antd icon name to use on the associated menu item button.
   * @type {String}
   * @memberof Page
   */
  icon;
  /**
   * The page to display
   * @type {Component}
   * @memberof Page
   */
  content;
  /**
   * Define the antd icon type of the extras button situated on the right side of the top navigation bar.
   * @type {String}
   * @memberof Page
   */
  extrasButtonType;

  /**
   * Define the way the top bar interacts with the content. Adaptive means the title name will be hidden when the scroll position is 0.
   * @type {"default" | "adaptive"}
   * @memberof Page
   */
  topBarMode;
  /**
   * Whether to hide the logo at the bottom of the page
   * @type {Boolean}
   * @memberof Page
   */
  hideFooter;
  /**
   * @type {boolean}
   * @memberof Page
   */
  requireProject = true;
  getNotificationCount = (project, user, messages) => {
    return 0;
  };
  getIcon = (user, project, selected, onPress) => {
    return (<div></div>)
  }
  /**
   * Creates an instance of Page.
   * @param {Page} args
   * @memberof Page
   */
  constructor(args) {
    Object.assign(this, args);
  }
}

/**
 * A list of pages that will be used for each project.
 */
export const Pages = [
  new Page({
    name: "Dashboard",
    icon: "dashboard",
    content: FEED,
    topBarMode: "adaptive",
    getNotificationCount: (project, user) => {
      return (project.history || []).filter(x => !(x.readBy || {})[user.uid])
        .length;
    }
  }),
  new Page({
    name: "Members",
    icon: "idcard",
    content: MEMBERS,
    extrasButtonType: "plus"
  }),
  new Page({
    name: "Timeline",
    icon: "calendar",
    content: TIMELINE,
    extrasButtonType: "plus"
  }),
  new Page({
    name: "Discuss",
    icon: "message",
    content: MESSAGES,
    hideFooter: true,
    getNotificationCount: (project, user, messages) => {
      if(!messages) return 0;
      return ($.object(messages || {}).values() || []).filter(
        x => x.content && !(x.readBy || {})[user.uid]
      ).length;
    }
  }),
  new Page({
    name: "Files",
    icon: "file-text",
    content: FILES,
    extrasButtonType: "plus"
  })
  // new Page({
  //   name: "Debug",
  //   icon: "code-o",
  //   content: DEBUG
  // })
];

/**
 * A list of pages that will be used for the home page.
 */
export const HomePage = [
  new Page({
    name: "Home",
    icon: "file",
    content: HOME,
    requireProject: false,
    topBarMode: "default",
    getNotificationCount: (project, user, messages) => {
      return user && user.pendingInvites ? user.pendingInvites.length : 0;
    },
    getIcon:(user,project,selected,onPress)=>(<BrandIcon
      onPress={onPress}
      selected={selected}
    />)
  })
];

/**
 * A list of pages that will be used for the user page.
 */
export const UserPage = [
  new Page({
    name: "Me",
    icon: "file",
    content: USER,
    requireProject: false,
    topBarMode: "adaptive",
    extrasButtonType: (
      <a
        href="https://myaccount.google.com/"
        rel="noopener noreferrer"
        target="_blank"
      >
        <Icon type="edit" />
      </a>
    ),
    getIcon:(user,project,selected,onPress)=>(
      <UserIcon
      thumbnail={user ? user.profilePhoto : ""}
      onPress={onPress}
      selected={selected}
    />
    )
  })
];

export const NotFoundPage = [
  new Page({
    name: "NotFound",
    icon: "file",
    content: <div></div>,
    requireProject: false,
    topBarMode: "default"
  })
]

export const SpecialPages = [
  ...HomePage, ...UserPage
]