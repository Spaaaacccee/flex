import React, { Component } from "react";
import "./App.css";
import Root from "./components/Root";
import { Modal, Icon } from "antd";
import "../node_modules/antd/dist/antd.min.css";
import Fire from "./classes/Fire";
import whyDidYouUpdate from 'why-did-you-update';
import {Scrollbars} from 'react-custom-scrollbars';

class App extends Component {
  componentDidMount() {
    // whyDidYouUpdate(React);
  }
  render() {
    return (
      <div className="App">
        <Root />
        <div style={{
          position: "fixed",
          overflow: "auto",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          zIndex: 1000,
          pointerEvents: "none"
        }}>
        <Scrollbars style={{textAlign: "left"}} className="modal-mount" autoHide hideTracksWhenNotNeeded></Scrollbars>
        </div>
      </div>
    );
  }
}

export default App;
