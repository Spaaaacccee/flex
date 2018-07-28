import React, { Component } from "react";
import ProjectIcon from "./ProjectIcon";
import { Icon } from "antd";

/**
 * Displays a user as an icon
 * @export
 * @class UserIcon
 * @extends Component
 */
export default class UserIcon extends Component {
  static defaultProps = {
    onPress: () => {},
    selected: false,
    thumbnail: ''
  };
  state = {
    onPress: () => {},
    selected: false,
    thumbnail:''
  };
  componentWillReceiveProps(props) {
    this.setState({
      onPress: props.onPress,
      selected: props.selected,
      thumbnail:props.thumbnail
    });
  }
  render() {
    return (
      <div>
        <ProjectIcon
          icon="user"
          thumbnail={this.state.thumbnail}
          onPress={() => {
            this.state.onPress();
          }}
          selected={this.state.selected}
        />
      </div>
    );
  }
}
