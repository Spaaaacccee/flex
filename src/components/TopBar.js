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

  shouldComponentUpdate(props, state) {
    if (props.heading !== this.state.heading) return true;
    if (props.leftButtonType !== this.state.leftButtonType) return true;
    if (props.rightButtonType !== this.state.rightButtonType) return true;
    if (props.visibilityMode !== this.state.visibilityMode) return true;
    if (props.scrollPosition === 0 && this.state.scrollPosition !== 0)
      return true;
    if (props.scrollPosition !== 0 && this.state.scrollPosition === 0)
      return true;
    return false;
  }

  render() {
    return (
      <div
        className={`top-bar-wrapper ${
          this.state.visibilityMode === "adaptive" &&
          this.state.scrollPosition <= 0
            ? "transparent top"
            : this.state.scrollPosition <= 0
              ? "top"
              : ""
        }`}
      >
        <Header className={`top-bar`}>
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
            icon={
              typeof this.state.rightButtonType === "string"
                ? this.state.rightButtonType
                : null
            }
            className="right-button"
            onTouchEnd={e => {
              this.props.onRightButtonPress();
              e.preventDefault();
              return true;
            }}
            onMouseUp={() => {
              this.props.onRightButtonPress();
            }}
          >
            {typeof this.state.rightButtonType !== "string" &&
              this.state.rightButtonType}
          </Button>
        </Header>
      </div>
    );
  }
}
