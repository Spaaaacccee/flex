import React, { Component } from "react";
import propTypes from "prop-types";
import { Layout, Button } from "antd";
import "./TopBar.css";
const { Header } = Layout;

export default class TopBar extends Component {
  static propTypes = {
    onLeftButtonPress:propTypes.func
  };
  static defaultProps = {
    onLeftButtonPress: () => {}
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
              onTouchEnd={(e) => {
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
          <Button shape="circle" icon="ellipsis" className="right-button" />
        </Header>
      </div>
    );
  }
}
