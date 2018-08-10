import React, { Component } from "react";

import './PrimaryIcon.css';

import {Avatar} from "antd";

/**
 * A simple circular icon
 * @export PrimaryIcon
 * @class PrimaryIcon
 * @extends Component
 */
export default class PrimaryIcon extends Component {

  static defaultProps = {
    text:"",
    background:"",
    backgroundColor: "" 
  }

  state = {
    text:"", // Text displayed in icon
    background:"", // A background in the form of an acceptable CSS background value
    backgroundColor: "" // A fallback background colour if the background value is unacceptable
  }
  
  componentWillReceiveProps(props) {
    this.setState({
      text:props.text,
      background:props.background,
      backgroundColor:props.backgroundColor
    });
  }

  shouldComponentUpdate(props,state) {
    if(props.text !== this.state.text) return true;
    if(props.background !== this.state.background) return true;
    if(props.backgroundColor !== this.state.backgroundColor) return true;
    return false;
  }

  render() {
    return (
      <div>
        <Avatar className="primary-icon" style={{backgroundImage:this.state.background,backgroundColor:this.state.backgroundColor}}>
          {
            this.state.background?'':this.state.text
          }
        </Avatar>
      </div>
    );
  }
}
