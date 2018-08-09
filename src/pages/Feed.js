import React, { Component } from "react";

import Fire from "../classes/Fire";
import $ from "../classes/Utils";

import { Card, Icon, Avatar, Button } from "antd";
import Messages from "../classes/Messages";
import formatJSON from "format-json-pretty";
import Project from "../classes/Project";
import User from "../classes/User";
import UserGroupDisplay from "../components/UserGroupDisplay";

const { Meta } = Card;

export default class FEED extends Component {
  /**
   * @type {{project:Project,user:User}}
   * @memberof FEED
   */
  state = {
    project: {},
    user: {}
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({
      project: props.project,
      user: props.user
    });
  }

  async getContent(project) {
    //let messages = (await Messages.get(project.messengerID)).;
  }

  render() {
    return (
      <div style={{ textAlign: "center" }}>
        {(this.state.project.history || []).map(item => (
          <div key={item.uid}>
            <Card
              title={
                <span>
                  <UserGroupDisplay people={{ members: [item.doneBy] }} />
                  {`${item.action} ${
                    $.string(item.type.substring(0, 1)).isVowel() ? "an" : "a"
                  } ${item.type}`}
                </span>
              }
            />
            <br />
          </div>
        ))}
      </div>
    );
  }
}
