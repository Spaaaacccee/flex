import React, { Component } from "react";

import { Button, message } from "antd";

import Fire from "../classes/Fire";
import * as firebaseui from "firebaseui";
import "../../node_modules/firebaseui/dist/firebaseui.css";

import "./SignIn.css";
import "./Pattern.css";

/**
 * Sign in screen for signing into the app
 * @export
 * @class SignIn
 * @extends Component
 */
export default class SignIn extends Component {
  static defaultProps = {
    onLogIn: () => { }
  };

  state = {
    signedIn: false, // Whether the user is signed in.
    loading: false, // Whether the sign in screen is currently loading.
    justClicked: false
  };

  /**
   * What to do when the user logs in.
   * @param  {any} user
   * @return {void}
   * @memberof SignIn
   */
  handleLogIn(user) {
    // Set this component to a signed in state.
    this.setState({
      signedIn: true,
      loading: false
    });

    // Notify the parent component.
    this.props.onLogIn(new logInArgs(user));
  }

  lastErrorMessage;

  /**
   * A loop to draw the log in button continuously. This is required to use a custom button along with the firebase log in UI.
   * @memberof SignIn
   */
  animationFrameLoop = () => {
    cancelAnimationFrame(this.animationFrameLoop);
    // If the user is logged in then stop the loop.
    if (this.state.signedIn) return;

    // If an error occured.
    let error = document.querySelector("p.firebaseui-info-bar-message");
    if (error) {
      if (this.lastErrorMessage !== error.textContent) {
        // If the error message is first shown, display a message. This avoids the messaage being shown multiple times.
        this.lastErrorMessage = error.textContent;
        message.error(error.textContent.replace("Dismiss", "").trim());
      }
    }
    let loading = !!document.querySelector("div.firebaseui-busy-indicator");
    let button = !!document.querySelector("button.firebaseui-idp-button");
    // If the loading state switched, reflect this change in the loading button.
    if ((loading || !button) && !this.state.loading) {
      this.setState({ loading: true }, () => {
        requestAnimationFrame(this.animationFrameLoop);
      });
      return;
    } else if ((!loading && button) && this.state.loading) {
      this.setState({ loading: false }, () => {
        requestAnimationFrame(this.animationFrameLoop);
      });
      return;
    }
    // Repeat the loop.
    requestAnimationFrame(this.animationFrameLoop);
  };

  componentDidMount() {
    // Start the loading animation loop.
    requestAnimationFrame(this.animationFrameLoop);

    // Log in.
    Fire.firebase()
      .auth()
      .onAuthStateChanged(user => {
        if (user) {
          // What to do if the user has logged in.
          Fire.authenticateGoogleAPIs(() => {
            // Notify the parent component.
            this.handleLogIn(user);
          });
        } else {
          // Remember the user so that they don't have to keep signing in every time.
          Fire.firebase()
            .auth()
            .setPersistence("local");

          // Configure firebase ui sign in.
          var uiConfig = {
            signInFlow: "redirect",
            signInOptions: [Fire.firebase().auth.GoogleAuthProvider.PROVIDER_ID],
            callbacks: {
              signInSuccessWithAuthResult: authResult => {
                // What to do if sign in is successful.
                Fire.authenticateGoogleAPIs(() => {
                  // Notify the parent component.
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
        className="sign-in-wrapper pattern"
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
            {/* The logo */}
            <img src="./icons/icon.png" className="logo-sign-in" />
            {/* The logo title */}
            <div
              style={{
                color: "rgb(40, 166, 240)",
                marginTop: 20,
                fontSize: 14,
                textTransform: "uppercase",
                letterSpacing: 3,
                marginBottom: 30
              }}
            >
              {/* Bonfire*/}
            </div>
            {/* The sign in button */}
            <Button
              style={{
                background: "rgb(42, 166, 253)",
                borderColor: "rgb(42, 166, 253)",
                padding: "5px 25px",
                width: 180,
                textAlign: "center",
              }}
              loading={this.state.justClicked || this.state.loading || Fire.firebase().auth().currentUser}
              type="primary"
              icon="google"
              size="large"
              onClick={() => {
                this.setState({justClicked: true});
                setTimeout(()=>{
                  this.setState({justClicked: false});
                },3000)
                document.querySelector("button.firebaseui-idp-button").click();
              }}
            >
              Sign In
            </Button>
            <br />
            <br />
            {/* A link to the github page */}
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
                Docs
              </Button>
            </a>
            <br />
            <br />
            <br />
            {/* A link to creating a Google account. */}
            <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer">
              <p
                style={{
                  color: "black",
                  opacity: 0.65,
                  textDecoration:"underline"
                }}
              >
                No Google account?
              </p>
            </a>
          </div>
          {/* Holds the original firebase ui */}
          <div style={{ display: "none", marginTop: -25 }} id="firebaseui-auth-container" />
        </div>
        <p style={{opacity: 0.5, position: "absolute", bottom: 25}}>
        2.0a Development Preview, React {React.version}
        </p>
      </div>
    );
  }
}

/**
 * A simple class to pass user info to the parent component when they have logged in.
 * @class logInArgs
 */
class logInArgs {
  /**
   * The information of the user who has logged in.
   * @memberof logInArgs
   */
  user;
  /**
   * Creates an instance of logInArgs.
   * @param  {any} user
   * @memberof logInArgs
   */
  constructor(user) {
    this.user = user;
  }
}
