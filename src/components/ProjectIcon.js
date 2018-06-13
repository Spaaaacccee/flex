import React, { Component } from "react";
import PrimaryIcon from "./PrimaryIcon";
import './ProjectIcon.css';

export default class ProjectIcon extends Component {
  static defaultProps = {
    name:"",
    thumbnail:"",
    onPress: ()=>{},
    selected:false
  }

  state = {
    selected:false
  }

  componentWillReceiveProps(props) {
    this.setState({
      selected:props.selected
    });
  }
  
  handlePress() {
    this.props.onPress();
  }

  render() {
    return (
      <div className={"project-icon " + (this.state.selected?"selected":"")}
          onMouseDown={this.handlePress.bind(this)}
          onTouchEnd={this.handlePress.bind(this)}
      >
        <PrimaryIcon 
            text={this.props.name.substring(0,1)}
        />
      </div>
    );
  }
}
