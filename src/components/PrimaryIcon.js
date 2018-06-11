import React, { Component } from "react";

import './PrimaryIcon.css';

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
        <Avatar className="primary-icon">
          {
            (()=>{
              function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
              
                for (var i = 0; i < 1; i++)
                  text += possible.charAt(Math.floor(Math.random() * possible.length));
              
                return text;
              }
              return makeid();
            })()
          }
        </Avatar>
      </div>
    );
  }
}
