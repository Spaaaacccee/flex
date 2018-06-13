import React, { Component } from "react";
import propTypes from "prop-types";
import { Menu } from "antd";

import ProjectIcon from "./ProjectIcon";

import Firebase from "firebase";

class ProjectIconItem {
  name;
  thumbnail;
  projectID;
  constructor(name, thumbnail, projectID) {
    this.name = name;
    this.thumbnail = thumbnail;
    this.projectID = projectID;
  }
}

class itemChangedEvent {
  item;
  index;
  constructor(item, index) {
    this.item = item;
    this.index = index;
  }
}

export default class ProjectNavigation extends Component {
  static propTypes = {
    onProjectChanged: propTypes.func,
    items: propTypes.arrayOf(propTypes.instanceOf(ProjectIconItem)),
    openedProject: propTypes.instanceOf(ProjectIconItem)
  };

  static defaultProps = {
    onProjectChanged: () => {},
    items: []
  };

  state = {
    items: [],
    openedProject: undefined,
    openedIndex: undefined
  };

  componentWillReceiveProps(props) {
    this.setState({ items: props.items }, () => {
      if (
        this.state.items.length &&
        typeof this.state.openedIndex === "undefined"
      )
        this.handlePress(0);
    });
  }

  handlePress(index) {
    this.setState({
      openedProject: this.state.items[index],
      openedIndex: index
    });
    this.props.onProjectChanged(
      new itemChangedEvent(this.state.items[index], index)
    );
  }

  render() {
    return (
      <div>
        <Menu style={{ height: "100vh", background: "hsla(216, 20%, 97%, 1)" }}>
          {//let array = []; //Firebase.database().ref();
          this.state.items.map((item, index) => 
            <ProjectIcon
                key={index}
                name={item.name}
                thumbnail={item.thumbnail}
                onPress={this.handlePress.bind(this, index)}
                selected={index === this.state.openedIndex}
            />
          )}
        </Menu>
      </div>
    );
  }
}
