import React, { Component } from "react";

import { Icon, Button } from "antd";

import Fire from "../classes/Fire";
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
    Fire.firebase()
      .auth()
      .onAuthStateChanged(user => {
        if (user) {
          this.handleLogIn(user);
        } else {
          Fire.firebase()
            .auth()
            .setPersistence("session");
          var uiConfig = {
            signInFlow: "redirect",
            signInOptions: [
              // Leave the lines as is for the providers you want to offer your users.
              Fire.firebase().auth.GoogleAuthProvider.PROVIDER_ID
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
          var ui = new firebaseui.auth.AuthUI(Fire.firebase().auth());
          // The start method will wait until the DOM is loaded.
          ui.start("#firebaseui-auth-container", uiConfig);
          this.setState({
            loading: false
          });
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
          <Button icon="key"
            style={{
              textAlign: "left",
              margin: 31.5,
              color: "white",
              width:155
            }}
            ghost
            onClick={() => {
              this.setState({
                loading: true
              });
              Fire.firebase()
                .auth()
                .signInAnonymously();
            }}
          >
            Sign in as guest
          </Button>
          <a
            href="https://accounts.google.com/signup"
            target="_blank"
            rel="noopener noreferrer"
          >
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
