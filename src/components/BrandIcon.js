import React, { Component } from "react";
import UserIcon from "./UserIcon";
import "./BrandIcon.css";

class BrandIcon extends Component {
  render() { 
    return ( <div className="brand-icon">
      <UserIcon {...this.props} thumbnail="./icons/icon.png"/>
      </div> );
  }
}
 
export default BrandIcon;