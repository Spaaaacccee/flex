import React, { Component } from "react";
import PrimaryIcon from "./PrimaryIcon";
import { Icon, Badge } from "antd";
import "./ProjectIcon.css";

/**
 * Component to display a project as an icon
 * @export ProjectIcon
 * @class ProjectIcon
 * @extends Component
 */
export default class ProjectIcon extends Component {
  static defaultProps = {
    name: "",
    thumbnail: "",
    onPress: () => {}, // A callback for when the item is pressed
    selected: false,
    icon: ""
  };

  state = {
    selected: false, // Whether this item is currently the active item
    thumbnail: "", // The thumbnail of the project either as a URL or a base64 encoded image
    name: "", // The name of the project
    icon: "", // An antd icon to use, in the form of an <Icon /> element
    style: {}, // Extra style supplied by the parent.
    notificationCount: 0, // The number to display as a badge.
    readOnly: false // Whether this icon is read only.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Update this component with new properties.
    this.setState({
      name: props.name,
      selected: props.selected,
      thumbnail: props.thumbnail,
      icon: props.icon,
      style: props.style || {},
      readOnly: props.readOnly,
      notificationCount: props.notificationCount || 0
    });
  }

  shouldComponentUpdate(props) {
    if (props.readOnly !== this.state.readOnly) return true;
    if (props.name !== this.state.name) return true;
    if (props.selected !== this.state.selected) return true;
    if (props.thumbnail !== this.state.thumbnail) return true;
    if (props.icon !== this.state.icon) return true;
    if ((props.notificationCount || 0) !== this.state.notificationCount) return true;
    // Don't update this component is no properties have changed.
    return false;
  }

  /**
   * Respond to pressing this item
   * @return {void}
   * @memberof ProjectIcon
   */
  handlePress() {
    this.props.onPress();
  }

  /**
   * Convert a thumbnail url or base64 encoded image to a CSS string.
   * @return
   * @memberof ProjectIcon
   */
  thumbnailToCSS() {
    if (this.state.thumbnail) {
      if (this.state.thumbnail.substring(0, 4) === "http") {
        // If the thumbnail starts with http, then return a url css string.
        return `url(${this.state.thumbnail})`;
      } else {
        // Otherwise, return a base 64 string.
        return `url(data:image/png;base64,${this.state.thumbnail})`;
      }
    } else {
      return "";
    }
  }

  render() {
    return (
      <div
        style={{
          ...(this.state.readOnly ? { pointerEvents: "none" } : {}),
          ...this.props.style
        }}
        className={"project-icon " + (this.state.selected ? "selected" : "")}
        onMouseUp={this.handlePress.bind(this)}
        onTouchStart={this.handlePress.bind(this)}
      >
        {/* Display a badge showing how many notifications there are */}
        <Badge count={this.state.notificationCount} offset={[15, 15]}>
          {/* Display the icon */}
          <PrimaryIcon
            background={this.thumbnailToCSS()}
            text={
              this.state.icon ? (
                <Icon type={this.state.icon} />
              ) : this.state.name ? (
                this.state.name.substring(0, 2).trim()
              ) : (
                <Icon type="fire" theme="filled" />
              )
            }
          />
        </Badge>
      </div>
    );
  }
}
