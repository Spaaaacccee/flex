import React, { Component } from 'react';
import Firebase from 'firebase';
import * as firebaseui from 'firebaseui';
import '../../node_modules/firebaseui/dist/firebaseui.css';

export default class SignIn extends Component {
componentDidMount () {
    var uiConfig = {
        signInFlow:"popup",
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          Firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>',
        callbacks: {
            signInSuccessWithAuthResult: (authResult, redirectUrl) => {
                console.log(authResult);
                return false;
            }
        }
      };

      // Initialize the FirebaseUI Widget using Firebase.
      var ui = new firebaseui.auth.AuthUI(Firebase.auth());
      // The start method will wait u   ntil the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
}
  render() {
    return (
      <div>
      <div id="firebaseui-auth-container" />
      </div>
    );
  }
}
