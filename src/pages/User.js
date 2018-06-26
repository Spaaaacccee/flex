import React, { Component } from "react";

import Fire from "../classes/Fire";

import UserIcon from "../components/UserIcon";

import User from "../classes/User";

import { Button, Modal } from "antd";

export default class Page_User extends Component {
    state= {
        visible:false
    }
  render() {
    return (
      <div>
        {Fire.firebase().auth().currentUser ? (
          <div>
            <UserIcon thumbnail={Fire.firebase().auth().currentUser.photoURL} />
            <b>{Fire.firebase().auth().currentUser.displayName||"Guest"}</b>
            <br/>
            {Fire.firebase().auth().currentUser.email||"No email address"}
            <br/>
            <br/><br/>
            <Button
              onClick={() => {
                Fire.firebase()
                  .auth()
                  .signOut();
                window.location.reload(true);
              }}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div>Loading really hard...</div>
        )}
      </div>
    );
  }
}
