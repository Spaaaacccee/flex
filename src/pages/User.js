import React, { Component } from "react";

import Fire from "../classes/Fire";

import UserIcon from "../components/UserIcon";
import "./User.css";
import User from "../classes/User";

import { Button, Icon } from "antd";
import { Card } from "antd";
import ProjectInvitation from "../components/ProjectInvitation";
import ProjectDisplay from "../components/ProjectDisplay";
import formatJSON from "format-json-pretty";
import ContextProvider from "../components/ContextProvider";
import { Scrollbars } from "react-custom-scrollbars";

export default class USER extends Component {
  state = {
    user: {} // The current user.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Update the user to match the properties.
    this.setState({ user: props.user });
  }

  shouldComponentUpdate(props, state) {
    if (!User.equal(this.state.user, props.user)) return true;
    if (!User.equal(this.state.user, state.user)) return true;
    // If the user hasn't changed then don't update anything.
    return false;
  }

  /**
   * Generate a gallery of project cards.
   * @param  {String} name 
   * @param  {String} notFoundMessage 
   * @param  {Object[]} data 
   * @param  {(data:Object)=>{}:JSX.ELement} renderComponent 
   * @return 
   * @memberof USER
   */
  generateProjectCards(name, notFoundMessage, data, renderComponent) {
    return (
      <Card title={name}>
        <Scrollbars
          style={{ margin: -24, width: "calc(100% + 48px)" }}
          autoHide
          hideTracksWhenNotNeeded
          autoHeight
          autoHeightMax={1000}
        >
          <div style={{ display: "flex", padding: 24 }}>
            {!!data && !!data.length
              ? data.map((item, index) => (
                <div style={{ paddingRight: 20, flex: "none" }} key={index}>
                  <ContextProvider projectID={item} userID={this.state.user.uid}>
                    {renderComponent(item)}
                  </ContextProvider>
                </div>
              ))
              : notFoundMessage}
          </div>
        </Scrollbars>
      </Card>
    );
  }

  render() {
    return (
      <div>
        {this.state.user && this.state.user.uid ? (
          <Card>
          <div style={{ textAlign: "left" }}>
            <div style={{ textAlign: "center" }}>
              <div className="user-page-icon">
                <UserIcon thumbnail={this.state.user.profilePhoto} />
              </div>
              <div style={{ marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 700
                  }}
                >
                  {this.state.user.name || <Icon type="loading" />}
                </span>
              </div>
              <div style={{ marginBottom: 20 }}>{this.state.user.email || <Icon type="loading" />}</div>
              <div>
                <Button
                  type="primary"
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
              <br />
              <br />
            </div>
          </div>
          </Card>
        ) : (
            <div>
              <Icon type="loading" />
            </div>
          )}
      </div>
    );
  }
}
