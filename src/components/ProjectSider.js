import React, { Component } from "react";

import "./ProjectSider.css";

import { Icon, Menu, Button, Badge } from "antd";
import Messages from "../classes/Messages";
import Project from "../classes/Project";
import User from "../classes/User";
import shallowEqualArrays from 'shallow-equal/arrays';
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
    onSettingsPress: () => {},
    items: [] // The buttons that will be rendered by default
  };
  state = {
    items: [],
    index: 0, // The index of the menu item that is currently open.
    notifications: []
  };

  shouldComponentUpdate(props, state) {
    if (props.index !== this.state.index) return true;
    if(!shallowEqualArrays(state.notifications||[], this.state.notifications||[])) return true;
    if (!shallowEqualArrays(props.items || [],this.state.items||[])) return true;
    return false;
  }

  updateNotifications(items, newProject, newUser, newMessages) {
    this.setState({notifications:items.map((item)=>(
      item.getNotificationCount(
        newProject,
        newUser,
        newMessages
      )
    ))})
  }

  componentWillReceiveProps(props) {
    this.setState({
      project: props.project,
      user: props.user,
      items: props.items,
      index: props.index,
    });
    this.updateNotifications(props.items,props.project,props.user,null)
    if (
      props.project &&
      props.project.projectID !== (this.state.project || {}).projectID
    ) {
      Messages.get(props.project.messengerID || props.project.projectID).then(
        messenger => {
          messenger.on("change", messages => {
            this.updateNotifications(this.state.items,this.state.project,this.state.user, messages)
          });
          messenger.startListening();
        }
      );
    } else {
      if (!props.project && this.state.messenger) {
        this.state.messenger.off();
        this.state.messenger.stopListening();
      }
    }
  }

  componentWillUnmount() {
    if (this.state.messenger) {
      this.state.messenger.off();
      this.state.messenger.stopListening();
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

  handleSettingsPress(e) {
    this.props.onSettingsPress();
  }

  handleInviteUsersPress() {
    this.props.onInviteUsersPress();
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
        key: Array.prototype.indexOf.call(t.parentNode.childNodes, t)
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
    let index = parseInt(e.key);
    this.setState({ index });
    this.handleOpenKeyChange(this.state.items[index], index);
  }

  render() {
    return (
      <div className="project-sider">
        <Button
          onClick={this.handleInviteUsersPress.bind(this)}
          type="primary"
          icon="user-add"
          style={{
            width: `calc(100% - ${2 * 22}px)`,
            margin: "18px 22px",
            marginTop: 0,
            height: 40,
            borderRadius: 80,
            background: "#E6F7FF",
            color: "#1990FF",
            borderColor: "#E6F7FF",
            fontWeight: 600
          }}
        >
          Invite Users
        </Button>
        <div onTouchEnd={this.handleTouchEnd.bind(this)}>
          <Menu
            className="sider-menu"
            onClick={this.handleClick.bind(this)}
            defaultSelectedKeys={["0"]}
            mode="inline"
            selectedKeys={["" + (this.state.index || 0)]}
          >
            {this.state.items.map((item, index) => (
              <Menu.Item key={"" + index}>
                <Icon type={item.icon} />
                <span>{item.name}</span>
                <Badge
                  offset={[-20, 0]}
                  count={
                    this.state.index === index
                      ? 0
                      : this.state.notifications[index]|| 0
                  }
                />
              </Menu.Item>
            ))}
          </Menu>
        </div>
        <Menu className="sider-menu settings-menu" selectedKeys={null}>
          <Menu.Item
            key="settings"
            style={{ paddingLeft: 24 }}
            onMouseUp={this.handleSettingsPress.bind(this)}
            onTouchEnd={this.handleSettingsPress.bind(this)}
          >
            <Icon type="setting" />
            <span>Project Settings</span>
          </Menu.Item>
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
