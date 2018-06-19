import React, { Component } from "react";
import Firebase from "firebase";

import Main from "./Main";

/**
 * Provides a layer for Firebase initialisation
 * @export Root
 * @class Root
 * @extends Component
 */
export default class Root extends Component {
  componentWillMount() {
    var config = {
      apiKey: "AIzaSyDky75Lh8P3sqMCB3MvUVnRjwfquOcMerE",
      authDomain: "flex-space.firebaseapp.com",
      databaseURL: "https://flex-space.firebaseio.com",
      projectId: "flex-space",
      storageBucket: "",
      messagingSenderId: "79879287257"
    };
    Firebase.initializeApp(config);
  }
  render() {
    return (
      <div style={{ height: "100%" }}>
        <Main />
      </div>
    );
  }
}
