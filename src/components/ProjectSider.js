import React, { Component } from "react";
import propTypes from "prop-types";

import "./ProjectSider.css";

import { Icon, Menu } from "antd";
const { SubMenu } = Menu;

/**
 * An class that contains information for constructing each sider item
 * @class SiderItemDef
 */
class SiderItemDef {
  /**
   * Antd icon name to use for the item
   * @memberof SiderItemDef
   */
  icon;
  /**
   * Name of the item
   * @memberof SiderItemDef
   */
  name;

  /**
   * Creates a new instance of SiderItemDef.
   * @param {String} name Name of the item
   * @param {String} icon Antd icon name to use for the item
   */
  constructor(name, icon) {
    this.icon = icon;
    this.name = name;
  }
}

/**
 * A sidebar for navigating a single specified project
 * @export ProjectSider
 * @class ProjectSider
 * @extends Component
 */
export default class ProjectSider extends Component {
  static defaultProps = {
    onItemSelected: () => {}, // A callback when an item is selected
    items: [
      new SiderItemDef("Feed", "appstore-o"),
      new SiderItemDef("Members", "team"),
      new SiderItemDef("Timeline", "calendar"),
      new SiderItemDef("Discussion", "message"),
      new SiderItemDef("Files", "file-text")
    ] // The buttons that will be rendered by default
  };
  state = {
    items: [],
    openKey: 0 // The index of the menu item that is currently open.
  };
  componentWillReceiveProps(props) {
    this.setState({
      items: props.items
    });
    if (props.items.length <= parseInt(this.state.openKey)) {
      this.setState({ openKey: props.items.length - 1 });
      this.handleOpenKeyChange(null, -1);
    }
    if (props.items && props.items !== this.state.items) {
      this.handleOpenKeyChange(props.items[0], 0);
    }
  }

  /**
   * Respond to when a new item has been selected
   * @param  {SiderItemDef} item
   * @param  {Number} index
   * @return {void}
   * @memberof ProjectSider
   */
  handleOpenKeyChange(item, index) {
    this.props.onItemSelected(new itemSelectedArgs(item, index));
  }

  /**
   * Respond to when a touch event occurs to offer touch compatibility
   * @param  {TouchEvent} e
   * @return {Boolean} Whether this event should propagate
   * @memberof ProjectSider
   */
  handleTouchEnd(e) {
    let t = e.target; // Find the original touch target
    // The currentTarget is the menu wrapper. If the touch occured on the menu element then return because none of the menu items was selected
    if (t.parentNode !== e.currentTarget) {
      while (t.parentNode.parentNode !== e.currentTarget) t = t.parentNode; // Traverse up the DOM hierarchy until the target element is a menu item.
      this.handleClick({
        key: String(Array.prototype.indexOf.call(t.parentNode.childNodes, t))
      }); // Get the index of the menu item and emulate click
    }
    e.preventDefault();
    return true;
  }

  /**
   * Respond to click of a menu item
   * @param  {any} e
   * @return {void}
   * @memberof ProjectSider
   */
  handleClick(e) {
    this.setState({ openKey: parseInt(e.key) });
    this.handleOpenKeyChange(
      this.state.items[parseInt(e.key)],
      parseInt(e.key)
    );
  }

  render() {
    return (
      <div onTouchEnd={this.handleTouchEnd.bind(this)}>
        <Menu
          className="sider-menu"
          onClick={this.handleClick.bind(this)}
          defaultSelectedKeys={["0"]}
          mode="inline"
          selectedKeys={[String(this.state.openKey) || "0"]}
        >
          {this.state.items.map((item, index) => (
            <Menu.Item key={index}>
              <Icon type={item.icon} />
              <span>{item.name}</span>
            </Menu.Item>
          ))}
        </Menu>
      </div>
    );
  }
}

/**
 * Arguments for the callback when an item is selected
 * @class itemSelectedArgs
 */
class itemSelectedArgs {
  /**
   * The item that was selected
   * @memberof itemSelectedArgs
   */
  item;

  /**
   * The position in the list of items that the item was located
   * @memberof itemSelectedArgs
   */
  index;
  /**
   * Creates an instance of itemSelectedArgs.
   * @param  {SiderItemDef} item The item that was selected
   * @param  {Number} index The position in the list of items that the item was located
   * @memberof itemSelectedArgs
   */
  constructor(item, index) {
    this.item = item;
    this.index = index;
  }
}
