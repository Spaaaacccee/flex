import React, { Component } from "react";
import ProjectIcon from "./ProjectIcon";
import "./UserIcon.css";

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
    thumbnail: ""
  };
  state = {
    selected: false, // Whether this item is selected.
    thumbnail: "" // The thumbnail image of the user.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Apply the supplied properties.
    this.setState({
      selected: props.selected,
      thumbnail: props.thumbnail
    });
  }
  render() {
    return (
      <div className="user-icon">
        {/* Display the user */}
        <ProjectIcon
          icon="user"
          thumbnail={this.state.thumbnail}
          onPress={() => {
            this.props.onPress();
          }}
          selected={this.state.selected}
        />
      </div>
    );
  }
}
