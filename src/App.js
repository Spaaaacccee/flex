import React, { Component } from "react";
import "./App.css";
import Root from "./components/Root";
import "../node_modules/antd/dist/antd.min.css";
import { Scrollbars } from "react-custom-scrollbars";

/**
 * The base app component.
 * @class App
 * @extends Component
 */
class App extends Component {
  render() {
    return (
      <div className="App">
        {/* Render the app root. */}
        <Root />
        {/* A div to mount all modal windows. */}
        <div
          style={{
            position: "fixed",
            overflow: "auto",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 1000,
            pointerEvents: "none"
          }}
        >
          <Scrollbars style={{ textAlign: "left" }} className="modal-mount" autoHide hideTracksWhenNotNeeded />
        </div>
      </div>
    );
  }
}
export default App;
