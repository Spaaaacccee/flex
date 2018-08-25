import React, { Component } from "react";

import { Button, message } from "antd";

import Fire from "../classes/Fire";
import * as firebaseui from "firebaseui";
import "../../node_modules/firebaseui/dist/firebaseui.css";

import "./SignIn.css";

/**
 * Sign in screen for signing into the app
 * @export
 * @class SignIn
 * @extends Component
 */
export default class SignIn extends Component {
  static defaultProps = {
    onLogIn: () => {}
  };

  state = {
    signedIn: false,
    loading: false
  };

  handleLogIn(user) {
    this.setState({
      signedIn: true,
      loading: false
    });
    if (this.timeout) clearTimeout(this.timeout);
    this.props.onLogIn(new logInArgs(user));
  }

  timeout;
  startTimeout() {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.setState({ loading: false }, () => {
        message.error("We couldn't sign you in because the operation timed out. Try signing in again.");
      });
    }, 20000);
  }

  componentDidMount() {
    if (sessionStorage.getItem("firebaseui::pendingRedirect") === '"pending"')
      this.setState({ loading: true }, () => {
        this.startTimeout();
      });
    Fire.firebase()
      .auth()
      .onAuthStateChanged(user => {
        if (user) {
          Fire.authenticateGoogleAPIs(() => {
            this.handleLogIn(user);
          });
        } else {
          Fire.firebase()
            .auth()
            .setPersistence("session");
          var uiConfig = {
            signInFlow: "redirect",
            signInOptions: [Fire.firebase().auth.GoogleAuthProvider.PROVIDER_ID],
            callbacks: {
              signInSuccessWithAuthResult: authResult => {
                Fire.authenticateGoogleAPIs(() => {
                  this.handleLogIn(authResult.user);
                });
                return false;
              }
            }
          };

          // Initialize the FirebaseUI Widget using Firebase.
          var ui = new firebaseui.auth.AuthUI(Fire.firebase().auth());
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
            <img src="./icons/icon.png" style={{ width: 50, marginTop: 10 }} />
            <div
              style={{
                color: `rgb(40, 166, 240)`,
                marginTop: 20,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: 3,
                marginBottom: 30
              }}
            >
              Bonfire
            </div>
            <Button
              style={{
                background: "rgb(42, 166, 253)",
                borderColor: "rgb(42, 166, 253)",
                padding: "5px 25px",
                width: 180,
                textAlign: "center",
                boxShadow: "rgba(4, 111, 210, 0.24) 0px 5px 20px"
              }}
              loading={this.state.loading || Fire.firebase().auth().currentUser}
              type="primary"
              icon="google"
              size="large"
              onClick={() => {
                this.setState({ loading: true }, () => {
                  this.startTimeout();
                });
                let x = setInterval(() => {
                  if (this.firebaseUIElement.querySelector("button")) {
                    this.firebaseUIElement.querySelector("button").click();
                    clearInterval(x);
                  }
                }, 250);
              }}
            >
              Sign In
            </Button>
            <br />
            <br />
            <a href="https://github.com/Spaaaacccee/flex" target="_blank" rel="noopener noreferrer">
              <Button
                icon="github"
                size="large"
                ghost
                style={{
                  width: 180,
                  borderColor: "rgb(42, 166, 253)",
                  color: "rgb(42, 166, 253)"
                }}
              >
                Docs on Github
              </Button>
            </a>
            <br />
            <br />
            <br />
            <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer">
              <p
                style={{
                  color: "black",
                  opacity: 0.65
                }}
              >
                No Google account?
              </p>
            </a>
          </div>
          <div
            ref={el => (this.firebaseUIElement = el)}
            style={{ display: "none", marginTop: -25 }}
            id="firebaseui-auth-container"
          />
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
