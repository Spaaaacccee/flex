import React, { Component } from "react";

import Page_User from "../pages/User";
import Page_Members from "../pages/Members";
import Page_Debug from "../pages/Debug";
import Page_Feed from "../pages/Feed";
import Page_Timeline from "../pages/Timeline";

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
   * Creates an instance of Page.
   * @param  {String} name
   * @param  {String} icon
   * @param  {Component} content
   * @memberof Page
   */
  constructor(name, icon, content) {
    this.name = name;
    this.icon = icon;
    this.content = content;
  }
}

/**
 * A list of pages that will be used for each project.
 */
export const Pages = [
  new Page("Feed", "appstore-o", Page_Feed),
  new Page("Members", "team", Page_Members),
  new Page("Timeline", "calendar", Page_Timeline),
  new Page("Discussion", "message", null),
  new Page("Files", "file-text", null),
  new Page("Debug", "code-o", Page_Debug)
];

/**
 * A list of pages that will be used for the user page.
 */
export const UserPage = [new Page("Me", "file", Page_User)];
