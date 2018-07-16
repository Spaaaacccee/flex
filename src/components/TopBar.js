import React, { Component } from "react";
import propTypes from "prop-types";
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
    onRightButtonPress: () => {},
  };
  state = {
    heading: "Heading",
    leftButtonStyle: "menu", //"menu", "back", "hidden"
    style: "solid" //"solid" or "blended"
  };
  componentWillReceiveProps(props) {
    this.setState({
      heading: props.heading,
      navbuttonStyle: props.leftButtonStyle
    });
  }
  render() {
    return (
      <div className="top-bar-wrapper">
        <Header className="top-bar">
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
            icon={
              this.state.leftButtonStyle === "menu" ? "menu-unfold" : "left"
            }
            className="left-button"
          />
          <div className="heading">{this.state.heading}</div>
            <Popover placement="bottomRight" content={(<div>Nothing here yet.</div>)} trigger="click">
            <Button shape="circle" icon="ellipsis" className="right-button" onTouchEnd={e => {
              this.props.onRightButtonPress();
              e.preventDefault();
              return true;
            }}
            onMouseUp={() => {
              this.props.onRightButtonPress();
            }}/>
            
            </Popover>
        </Header>
      </div>
    );
  }
}
