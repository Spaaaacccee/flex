import React, { Component } from "react";

import {Avatar} from "antd";

export default class PrimaryIcon extends Component {
  // props = {
  //   iconURL,
  //   icon
  // };
  defaultIcon = "#EEE";
  render() {
    return (
      <div>
        <Avatar style={{margin:5,borderRadius:54,width:54,height:54,backgroundColor:this.defaultIcon}}/>
      </div>
    );
  }
}
