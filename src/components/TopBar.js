import React, { Component } from "react";

import { Layout, Button } from "antd";
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
    visibilityMode: "default", // Whether the top bar is visible when scrolled down, "default", "adaptive"
    scrollPosition: 0 // The current vertical page scroll position
  };

  componentWillReceiveProps(props) {
    // Update this component with new properties.
    this.setState({
      heading: props.heading,
      leftButtonType: props.leftButtonType,
      rightButtonType: props.rightButtonType,
      visibilityMode: props.visibilityMode,
      scrollPosition: props.scrollPosition
    });
  }

  shouldComponentUpdate(props) {
    if (props.heading !== this.state.heading) return true;
    if (props.leftButtonType !== this.state.leftButtonType) return true;
    if (props.rightButtonType !== this.state.rightButtonType) return true;
    if (props.visibilityMode !== this.state.visibilityMode) return true;
    if (props.scrollPosition === 0 && this.state.scrollPosition !== 0) return true;
    if (props.scrollPosition !== 0 && this.state.scrollPosition === 0) return true;
    // Don't update anything if no properties have changed.
    return false;
  }

  render() {
    return (
      <div
        // If the visibility mode is adaptive, make the top transparent if the scroll position is at 0.
        className={`top-bar-wrapper ${
          this.state.visibilityMode === "adaptive" && this.state.scrollPosition <= 0
            ? "transparent top"
            : this.state.scrollPosition <= 0
              ? "top"
              : ""
        }`}
      >
        <Header className="top-bar">
          {/* Display the left button */}
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
          {/* Display the name */}
          <div className="heading">{this.state.heading}</div>
          {this.state.rightButtonType ? (
            // If the right button type exists, then display it
            <Button
              type="primary"
              shape="circle"
              icon={typeof this.state.rightButtonType === "string" ? this.state.rightButtonType : null}
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
              {/* If the right button type exists and is a string, then display it */}
              {typeof this.state.rightButtonType !== "string" && this.state.rightButtonType}
            </Button>
          ) : (
            <div style={{ width: 36, height: 36 }} />
          )}
        </Header>
      </div>
    );
  }
}
