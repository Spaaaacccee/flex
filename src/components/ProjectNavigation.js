import React, { Component } from "react";
import propTypes from "prop-types";
import { Menu } from "antd";

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
        <Menu>
          {(() => {
            let array = []; //Firebase.database().ref();
            array.forEach(element => {});
          })()}
        </Menu>
      </div>
    );
  }
}
