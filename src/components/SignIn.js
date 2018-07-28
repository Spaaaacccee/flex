import React, { Component } from "react";

import { Icon, Button } from "antd";

import Fire from "../classes/Fire";
import * as firebaseui from "firebaseui";
import "../../node_modules/firebaseui/dist/firebaseui.css";

import "./SignIn.css";
import UserIcon from "./UserIcon";

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
    this.props.onLogIn(new logInArgs(user));
  }

  componentDidMount() {
    if (sessionStorage.getItem("firebaseui::pendingRedirect") === `"pending"`)
      this.setState({ loading: true });
    Fire.firebase()
      .auth()
      .onAuthStateChanged(user => {
        if (user) {
          Fire.authenticateGoogleAPIs(()=>{
            this.handleLogIn(user);
          })
        } else {
          Fire.firebase()
            .auth()
            .setPersistence("session");
          var uiConfig = {
            signInFlow: "redirect",
            signInOptions: [
              Fire.firebase().auth.GoogleAuthProvider.PROVIDER_ID
            ],
            callbacks: {
              signInSuccessWithAuthResult: (authResult, redirectUrl) => {
                console.log(authResult);
                Fire.authenticateGoogleAPIs(()=>{
                  this.handleLogIn(authResult.user);
                })
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
            <h2>Sign in</h2>
            <br />
            <UserIcon />
            <br />
            <Button
              loading={this.state.loading}
              type="primary"
              icon="google"
              onClick={() => {
                this.setState({ loading: true });
                let x = setInterval(() => {
                  if (this.firebaseUIElement.querySelector("button")) {
                    this.firebaseUIElement.querySelector("button").click();
                    clearInterval(x);
                  }
                }, 250);
              }}
            >
              Sign in with Google
            </Button>
            <br />
            <br />
            <br />
            <a
              href="https://accounts.google.com/signup"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p
                style={{
                  color: "black"
                }}
              >
                <Icon type="link" /> Create a Google account
              </p>
            </a>
          </div>
          <div
            ref={el => (this.firebaseUIElement = el)}
            style={{ display: "none", marginTop: -25 }}
            id="firebaseui-auth-container"
          />
          {
            //   <Button
            //   icon="key"
            //   size="large"
            //   style={{
            //     textAlign: "left",
            //     margin: 31.5,
            //     width: 168
            //   }}
            //   onClick={() => {
            //     this.setState({
            //       loading: true
            //     });
            //     Fire.firebase()
            //       .auth()
            //       .signInAnonymously();
            //   }}
            // >
            //   Sign in as guest
            // </Button>
          }
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
