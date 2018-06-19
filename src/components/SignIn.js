import React, { Component } from "react";

import { Icon } from "antd";

import Firebase from "firebase";
import * as firebaseui from "firebaseui";
import "../../node_modules/firebaseui/dist/firebaseui.css";

import "./SignIn.css";

export default class SignIn extends Component {
  static defaultProps = {
    onLogIn: () => {}
  };

  state = {
    signedIn: false,
    loading: true
  };

  handleLogIn(user) {
    this.setState({
      signedIn: true,
      loading: false
    });
    this.props.onLogIn(new logInArgs(user));
  }

  componentDidMount() {
    Firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.handleLogIn(user);
      } else {
        Firebase.auth().setPersistence("local");
        var uiConfig = {
          signInFlow: "redirect",
          signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            Firebase.auth.GoogleAuthProvider.PROVIDER_ID
          ],
          callbacks: {
            signInSuccessWithAuthResult: (authResult, redirectUrl) => {
              console.log(authResult);
              this.handleLogIn(authResult.user);
              return false;
            }
          }
        };

        // Initialize the FirebaseUI Widget using Firebase.
        var ui = new firebaseui.auth.AuthUI(Firebase.auth());
        // The start method will wait until the DOM is loaded.
        ui.start("#firebaseui-auth-container", uiConfig);
      }
    });
  }
  render() {
    return (
      <div
        className="sign-in-wrapper"
        style={
          this.state.signedIn
            ? {
                opacity: 0,
                pointerEvents: "none"
              }
            : {
                opacity: 1,
                pointerEvents: "all"
              }
        }
      >
        <div className="sign-in">
          <div className="sign-in-text">
            <Icon type="login" style={{ fontSize: 48 }} />
            <br />
            <br />
            <h1>{this.state.loading ? "Signing In..." : "Sign In"}</h1>
            <p>Sign in with your Google account to continue.</p>
            <Icon
              style={{
                fontSize: 24,
                display: this.state.loading ? "block" : "none",
                textAlign: "left"
              }}
              type="loading"
            />
          </div>
          <div
            style={{ display: this.state.loading ? "none" : "block" }}
            id="firebaseui-auth-container"
          />
          <a href="https://accounts.google.com/signup" target="_blank">
            <p
              style={{
                textAlign: "left",
                margin: 31.5,
                color: "white"
              }}
            >
              <Icon type="link" /> Create a Google account
            </p>
          </a>
        </div>
      </div>
    );
  }
}

class logInArgs {
  user;
  constructor(user) {
    this.user = user;
  }
}
