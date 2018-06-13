import React, { Component } from "react";
import propTypes from "prop-types";

import "./ProjectSider.css";

import { Icon, Menu } from "antd";
const { SubMenu } = Menu;

class SiderItemDef {
  icon;
  name;

  /**
   * Create a new sider item definition
   * @param {string} name Name of the item
   * @param {string} icon Antd icon name to use for the item
   */
  constructor(name, icon) {
    this.icon = icon;
    this.name = name;
  }
}

export default class ProjectSider extends Component {
  static defaultProps = {
    onItemSelected: () => {},
    items: [
      new SiderItemDef("Feed", "appstore-o"),
      new SiderItemDef("Members", "team"),
      new SiderItemDef("Timeline", "calendar"),
      new SiderItemDef("Discussion", "message"),
      new SiderItemDef("Files", "file-text")
    ]
  };
  state = {
    items: []
  };
  componentWillReceiveProps(props) {
    this.setState({ items: props.items });
  }

  handleOpenKeyChange(item, index) {
    this.props.onItemSelected(new itemSelectedEvent(item, index));
  }

  handleTouchEnd(e) {
    let t = e.target;
    if (e.target.parentNode === e.currentTarget) return;
    while (t.parentNode.parentNode !== e.currentTarget) t = t.parentNode;
    let index = Array.prototype.indexOf.call(t.parentNode.childNodes, t);
    this.setState({ openKey: index.toString() });
    this.handleOpenKeyChange(
      this.state.items[parseInt(index)],
      parseInt(index)
    );
    e.preventDefault();
    return true;
  }

  handleClick(e) {
    this.setState({ openKey: e.key });
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
            selectedKeys={[this.state.openKey || "0"]}
        >
          {this.state.items.map((item, index) => 
            <Menu.Item key={index}>
              <Icon type={item.icon} />
              <span>{item.name}</span>
            </Menu.Item>
          )}
        </Menu>
      </div>
    );
  }
}

class itemSelectedEvent {
  item;
  index;
  constructor(item, index) {
    this.item = item;
    this.index = index;
  }
}
