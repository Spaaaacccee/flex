import React, { Component } from "react";
import PrimaryIcon from "./PrimaryIcon";
import "./ProjectIcon.css";

/**
 * Component to display a project as an icon
 * @export ProjectIcon
 * @class ProjectIcon
 * @extends Component
 */
export default class ProjectIcon extends Component {
  static defaultProps = {
    name: "", // The name of the project
    thumbnail: "", // The thumbnail of the project either as a URL or a base64 encoded image
    onPress: () => {}, // A callback for when the item is pressed
    selected: false, // Whether this item is currently the active item
    icon: "" // An antd icon to use, in the form of an <Icon /> element
  };

  state = {
    selected: false,
    thumbnail: "",
    name: "",
    icon: ""
  };

  componentWillReceiveProps(props) {
    this.setState({
      name: props.name,
      selected: props.selected,
      thumbnail: props.thumbnail,
      icon: props.icon
    });
  }

  /**
   * Respond to pressing this item
   * @return {void}
   * @memberof ProjectIcon
   */
  handlePress() {
    this.props.onPress();
  }

  thumbnailToCSS() {
    if (this.state.thumbnail) {
      if (this.state.thumbnail.substring(0, 4) === "http") {
        return `url(${this.state.thumbnail})`;
      } else {
        return `url(data:image/png;base64,${this.state.thumbnail})`;
      }
    } else {
      return "";
    }
  }

  render() {
    return (
      <div
        className={"project-icon " + (this.state.selected ? "selected" : "")}
        onMouseUp={this.handlePress.bind(this)}
        onTouchEnd={this.handlePress.bind(this)}
      >
        <PrimaryIcon
          background={this.thumbnailToCSS()}
          text={
            this.state.icon
              ? this.state.icon
              : this.state.name
                ? this.state.name.substring(0, 1)
                : ""
          }
        />
      </div>
    );
  }
}
