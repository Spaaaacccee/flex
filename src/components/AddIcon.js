import React, { Component } from "react";
import { Icon } from "antd";
import PrimaryIcon from "./PrimaryIcon";
import "./AddIcon.css";
import "./ProjectIcon.css";

/**
 * Simple circle button with an add symbol.
 * @export AddIcon
 * @class ProjectIcon
 * @extends Component
 */
export default class AddIcon extends Component {
  static defaultProps = {
    onPress: () => {}, // A callback for when the item is pressed
    selected: false // Whether this item is currently the active item
  };

  /**
   * Respond to pressing this item
   * @return {void}
   * @memberof AddIcon
   */
  handlePress() {
    this.props.onPress();
  }

  render() {
    return (
      <div
        className={"project-icon add-icon"}
        // Add mouse up and touch handlers separately to optimise for touch input
        onMouseUp={this.handlePress.bind(this)}
        onTouchStart={this.handlePress.bind(this)}
      >
        <PrimaryIcon text={<Icon type="plus" />} />
      </div>
    );
  }
}
