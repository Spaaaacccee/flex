import React, { Component } from "react";

import Fire from "../classes/Fire";

import UserIcon from "../components/UserIcon";

import User from "../classes/User";

import { Button, Modal, Icon } from "antd";

export default class Page_User extends Component {
    state= {
        visible:false
    }
    componentWillReceiveProps(props) {
      this.setState({project:props.project});
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
          <div><Icon type="loading" style={{ fontSize: 24 }} spin /></div>
        )}
      </div>
    );
  }
}
