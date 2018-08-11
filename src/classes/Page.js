import React, { Component } from "react";

import {Icon} from 'antd';

import USER from "../pages/User";
import MEMBERS from "../pages/Members";
import DEBUG from "../pages/Debug";
import FEED from "../pages/Feed";
import TIMELINE from "../pages/Timeline";
import FILES from "../pages/Files";
import MESSAGES from "../pages/Messages";

/**
 * Represents a single page that can be displayed within the app.
 * @export
 * @class Page
 */
export default class Page {

  static equal(a,b) {
    return (a&&b) && a.name===b.name;
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
   * Define the way the top bar interacts with the content
   * @type {"default" | "adaptive"}
   * @memberof Page
   */
  topBarMode;
  /**
   * @type {boolean}
   * @memberof Page
   */
  requireProject=true;
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
    name: "Home",
    icon: "appstore-o",
    content: FEED,
    topBarMode: "adaptive"
  }),
  new Page({
    name: "Members",
    icon: "team",
    content: MEMBERS
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
    content: MESSAGES
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
 * A list of pages that will be used for the user page.
 */
export const UserPage = [
  new Page({
    name: "Me",
    icon: "file",
    content: USER,
    requireProject: false,
    topBarMode: "adaptive",
    extrasButtonType: (<a href="https://myaccount.google.com/" target="_blank"><Icon type="edit"/></a>)
  })
];
