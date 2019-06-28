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
    thumbnail: "",
    name: ""
  };
  state = {
    name: "",
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
      thumbnail: props.thumbnail,
      name: props.name
    });
  }
  render() {
    return (
      <div className="user-icon">
        {/* Display the user */}
        <ProjectIcon
          icon="user"
          thumbnail={this.state.thumbnail}
          name={this.state.name}
          onPress={() => {
            this.props.onPress();
          }}
          selected={this.state.selected}
        />
      </div>
    );
  }
}
