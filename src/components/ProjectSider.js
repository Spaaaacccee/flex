import React, { Component } from "react";
import propTypes from 'prop-types';

import './ProjectSider.css';

import { Icon, Menu } from "antd";
const { SubMenu } = Menu;

class SiderItemDef {
  iconName;
  name;

  /**
   * Create a new sider item definition
   * @param {string} name Name of the item
   * @param {string} iconName Antd icon name to use for the item
   */
  constructor(name, iconName) {
    this.iconName = iconName;
    this.name = name;
  }
}

export default class ProjectSider extends Component {
  static defaultProps = {
      onItemSelected: ()=>{}
  }
  state = {
    items: [
      new SiderItemDef("Feed", "appstore-o"),
      new SiderItemDef("Members", "team"),
      new SiderItemDef("Timeline", "calendar"),
      new SiderItemDef("Discussion", "message"),
      new SiderItemDef("Files", "file-text")
    ]
  };
  render() {
    return (
      <div onTouchEnd={(e)=>{
        let t = e.target;
        if (e.target.parentNode === e.currentTarget) return;
        while(t.parentNode.parentNode !== e.currentTarget) t = t.parentNode;
        this.setState({openKey:Array.prototype.indexOf.call(t.parentNode.childNodes,t).toString()});
        this.props.onItemSelected();
        e.preventDefault();
    }}>
        <Menu className="sider-menu"
            onClick={(e)=>{
                this.setState({openKey:e.key});
            }}
            //style={{ width: 256 }}
            defaultSelectedKeys={['0']}
            //defaultOpenKeys={['0']}
            mode="inline"
            selectedKeys={[this.state.openKey||'0']}
        >
          {this.state.items.map((item, index) => 
            <Menu.Item key={index}>
            <Icon type={item.iconName} />
            <span>{item.name}</span>
          </Menu.Item>
          )}
        </Menu>
      </div>
    );
  }
}
