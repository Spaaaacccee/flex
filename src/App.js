import React, { Component } from "react";
import "./App.css";
import Root from "./components/Root";
import { Modal, Icon } from "antd";
import "../node_modules/antd/dist/antd.min.css";
import Fire from "./classes/Fire";

class App extends Component {
  state = {
    offline: false
  };
  componentDidMount() {
    window.addEventListener("load", () => {
      setTimeout(() => {
        Fire.firebase()
          .database()
          .ref(".info/connected")
          .on("value", snapshot => {
            console.log(snapshot.val());
            this.setState({ offline: !snapshot.val() });
          });
      }, 5000);
    });
  }
  render() {
    return (
      <div className="App">
        <Root />
        <Modal
          closable={false}
          footer={null}
          maskClosable={false}
          visible={this.state.offline}
        >
          <Icon type="wifi" style={{ color: "#1890FF", fontSize: 24 }} />
          <h2>You seem to be offline.</h2>
          <p>We'll let you resume as soon as you reconnect to the internet.</p>
        </Modal>
      </div>
    );
  }
}

export default App;
