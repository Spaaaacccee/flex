import React, { Component } from "react";
import "./App.css";
import Root from "./components/Root";
import { Modal, Icon } from "antd";
import "../node_modules/antd/dist/antd.min.css";
import Fire from "./classes/Fire";
import whyDidYouUpdate from 'why-did-you-update';

class App extends Component {
  componentDidMount() {
    // whyDidYouUpdate(React);
  }
  render() {
    return (
      <div className="App">
        <Root />
      </div>
    );
  }
}

export default App;
