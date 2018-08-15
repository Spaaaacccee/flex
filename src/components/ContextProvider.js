import React, { Component } from "react";
import Project from "../classes/Project";
import Fetch from "../classes/Fetch";
import User from "../classes/User";

export default class ContextProvider extends Component {
  state = {
    project: null,
    projectID: null,
    user: null,
    userID: null
  };

  projectReference;
  userReference;

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    if (props.projectID !== this.state.projectID) {
      if (this.projectReference) {
        this.projectReference.off();
        this.projectReference = null;
      }
      this.projectReference = Fetch.getProjectReference(props.projectID);
      this.projectReference.on("value", snapshot => {
        this.setState({ project: snapshot.val()});
      });
      this.setState({ projectID: props.projectID });
    }
    if (props.userID !== this.state.userID) {
      if (this.userReference) {
        this.userReference.off();
        this.userReference = null;
      }
      this.userReference = Fetch.getUserReference(props.userID);
      this.userReference.on("value", snapshot => {
        this.setState({ user: snapshot.val()});
      });
      this.setState({ userID: props.userID });
    }
  }

  shouldComponentUpdate(props, state) {
    if (!Project.equal(this.state.project, state.project)) return true;
    if (!User.equal(this.state.user, state.user)) return true;
    if (props.projectID !== this.state.projectID) return true;
    if (props.userID !== this.state.userID) return true;
    return false;
  }

  render() {
    return (
      <div>
        {React.Children.map(this.props.children, item =>
          React.cloneElement(item, {
            project: this.state.project,
            user: this.state.user
          })
        )}
      </div>
    );
  }
}
