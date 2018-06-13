import React, { Component } from "react";

import './PrimaryIcon.css';

import {Avatar} from "antd";

export default class PrimaryIcon extends Component {
  // props = {
  //   iconURL,
  //   icon
  // };
  static defaultProps = {
    text:"",
    background:"",
    backgroundColor: "red"
  }
  
  render() {
    return (
      <div>
        <Avatar className="primary-icon">
          {
            this.props.text
          }
        </Avatar>
      </div>
    );
  }
}
