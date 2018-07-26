import React, { Component } from "react";

import USER from "../pages/User";
import MEMBERS from "../pages/Members";
import DEBUG from "../pages/Debug";
import FEED from "../pages/Feed";
import TIMELINE from "../pages/Timeline";
import FILES from "../pages/Files";

/**
 * Represents a single page that can be displayed within the app.
 * @export
 * @class Page
 */
export default class Page {
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
    name: "Feed",
    icon: "appstore-o",
    content: FEED,
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
    name: "Discussion",
    icon: "message",
    content: null
  }),
  new Page({
    name: "Files",
    icon: "file-text",
    content: FILES,
    extrasButtonType: "plus"
  }),
  new Page({
    name: "Debug",
    icon: "code-o",
    content: DEBUG
  })
];

/**
 * A list of pages that will be used for the user page.
 */
export const UserPage = [new Page({
  name: "Me",
  icon: "file",
  content: USER
})];
