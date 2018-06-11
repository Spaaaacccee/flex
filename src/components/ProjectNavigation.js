import React, { Component } from "react";
import propTypes from "prop-types";
import { Menu } from "antd";

import ProjectIcon from "./ProjectIcon";

import Firebase from "firebase";

export default class ProjectNavigation extends Component {
  static propTypes = {
    onProjectChanged: propTypes.func
  };

  static defaultProps = {
    onProjectChanged: () => {}
  };

  render() {
    return (
      <div>
        <Menu style={{height:'100vh'}}>
          {/*(() => {
            let array = []; //Firebase.database().ref();
            array.map(item => <div />);
          })()*/}
          <ProjectIcon/><ProjectIcon/><ProjectIcon/><ProjectIcon/><ProjectIcon/>
        </Menu>
      </div>
    );
  }
}
