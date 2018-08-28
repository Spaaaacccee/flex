import React, { Component } from "react";

import { Icon, message } from "antd";

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
    // Add a listener for when the page has loaded. A 2 second delay is added because the online/offline detector sometimes returns false positive.
    window.addEventListener("load", () => {
      setTimeout(() => {
        this.setState({ loaded: true });
      }, 2000);
    });
    // Ask the user for notification permission, if notification is supported.
    if (window.Notification) {
      if (Notification.permission !== "granted") {
        Notification.requestPermission().then(result => {
          // If the user denies permission, then display a message.
          if (result !== "granted") {
            message.warn("You won't receive notifications if you don't give us permission.");
            return;
          }
        });
      }
    }
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
            background: "rgb(252, 252, 252)",
            opacity: this.state.loaded ? 0 : 1,
            pointerEvents: this.state.loaded ? "none" : "all" 
          }}
        >
          <div>
            <img src="/icons/icon.png" style={{ width: 50, height: 50 }} />
          </div>
        </div>
        <div style={{ height: "100%", opacity: this.state.loaded ? 1 : 0, pointerEvents: this.state.loaded ? "all" : "none" }}>
          <Main ref={this.main} />
        </div>
      </div>
    );
  }
}
