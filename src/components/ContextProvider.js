import React, { Component } from "react";
import Project from "../classes/Project";
import Fetch from "../classes/Fetch";
import User from "../classes/User";

/**
 * A component to provide project and user information to child components given user and project ids.
 * @export
 * @class ContextProvider
 * @extends Component
 */
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
    // Set project data when the source changes.
    let projectCallback = snapshot => {
      this.setState({ project: snapshot.val()});
    }

    // Reset the project reference, but only if the newly supplied ID doesn't equal the old one.
    if (props.projectID !== this.state.projectID) {
      // Detach the value listener.
      if (this.projectReference) {
        this.projectReference.off("value", projectCallback);
        this.projectReference = null;
      }
      // Get a reference to the new project and attach listeners.
      this.projectReference = Fetch.getProjectReference(props.projectID);
      this.projectReference.on("value", projectCallback);
      // Set the new project ID
      this.setState({ projectID: props.projectID });
    }

    // Reset the user reference, but only if the newly supplied ID doesn't equal the old one.
    if (props.userID !== this.state.userID) {
      // Detach the old value listener.
      if (this.userReference) {
        this.userReference.off();
        this.userReference = null;
      }
      // Get a reference to the new user and attach listeners.
      this.userReference = Fetch.getUserReference(props.userID);
      this.userReference.on("value", snapshot => {
        this.setState({ user: snapshot.val()});
      });
      // Set the new user ID
      this.setState({ userID: props.userID });
    }
  }

  shouldComponentUpdate(props, state) {
    if (!Project.equal(this.state.project, state.project)) return true;
    if (!User.equal(this.state.user, state.user)) return true;
    if (props.projectID !== this.state.projectID) return true;
    if (props.userID !== this.state.userID) return true;
    // Prevent the component from updating if nothing has changed.
    return false;
  }

  render() {
    return (
      <div>
        {React.Children.map(this.props.children, item =>
          // Supply user and project element to each of the children.
          React.cloneElement(item, {
            project: this.state.project,
            user: this.state.user
          })
        )}
      </div>
    );
  }
}
