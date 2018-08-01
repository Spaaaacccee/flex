import React, { Component } from "react";
import "./App.css";
import Root from "./components/Root";
import { Modal, Icon } from "antd";
import "../node_modules/antd/dist/antd.min.css";
import Fire from "./classes/Fire";

class App extends Component {

  render() {
    return (
      <div className="App">
        <Root />
      </div>
    );
  }
}

export default App;
