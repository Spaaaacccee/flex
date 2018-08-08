import React, { Component } from "react";

import { Layout, Button, Popover } from "antd";
import "./TopBar.css";
const { Header } = Layout;

/**
 * A navigation bar situated at the top of the screen
 * @export
 * @class TopBar
 * @extends Component
 */
export default class TopBar extends Component {
  static defaultProps = {
    onLeftButtonPress: () => {},
    onRightButtonPress: () => {}
  };
  state = {
    heading: "Heading",
    leftButtonType: "menu", //"menu", "back", "hidden"
    style: "solid", //"solid" or "blended"
    rightButtonType: "", //icon type
    visibilityMode: "default",
    scrollPosition: 0
  };
  componentWillReceiveProps(props) {
    this.setState({
      heading: props.heading,
      leftButtonType: props.leftButtonType,
      rightButtonType: props.rightButtonType,
      visibilityMode: props.visibilityMode,
      scrollPosition: props.scrollPosition
    });
  }

  render() {
    return (
      <div className={`top-bar-wrapper ${
        this.state.visibilityMode === "adaptive" &&
        this.state.scrollPosition === 0
          ? "transparent"
          : ""
      }`}>
        <Header
          className={`top-bar`}
        >
          <Button
            onTouchEnd={e => {
              this.props.onLeftButtonPress();
              e.preventDefault();
              return true;
            }}
            onMouseUp={() => {
              this.props.onLeftButtonPress();
            }}
            shape="circle"
            icon={this.state.leftButtonType === "menu" ? "menu-unfold" : "left"}
            className="left-button"
          />
          <div className="heading">{this.state.heading}</div>
          <Button
            shape="circle"
            icon={this.state.rightButtonType}
            className="right-button"
            onTouchEnd={e => {
              this.props.onRightButtonPress();
              e.preventDefault();
              return true;
            }}
            onMouseUp={() => {
              this.props.onRightButtonPress();
            }}
          />
        </Header>
      </div>
    );
  }
}
