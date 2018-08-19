import React, { Component } from "react";

import { Icon } from "antd";

import Main from "./Main";

/**
 * A root wrapper. Also provides the initial loading screen, since the root loads before any other component
 * @export Root
 * @class Root
 * @extends Component
 */
export default class Root extends Component {
  state = {
    loaded: false
  };
  constructor() {
    super();
    window.addEventListener("load", () => {
      setTimeout(() => {
        this.setState({ loaded: true });
      }, 2000);
    });
  }
  render() {
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <div
          style={{
            position: "fixed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100vw",
            height: "100%",
            fontSize: 24,
            flexDirection: "column",
            background: "rgb(252, 252, 252)"
          }}
        >
          <div>
            <img src="/icons/icon.png" style={{width:50,height:50}}/>
          </div>
        </div>
        <div style={{ height: "100%", opacity: this.state.loaded ? 1 : 0 }}>
          <Main ref={this.main} />
        </div>
      </div>
    );
  }
}
