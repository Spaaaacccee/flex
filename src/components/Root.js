import React, { Component } from "react";

import Main from "./Main";

/**
 * A root wrapper
 * @export Root
 * @class Root
 * @extends Component
 */
export default class Root extends Component {
  render() {
    return (
      <div style={{ height: "100%" }}>
        <Main ref={this.main}/>
      </div>
    );
  }
}
