import React, { Component } from "react";
import { Tabs, List } from "antd";
import MemberDisplay from "../components/MemberDisplay";

export default class Page_Members extends Component {
  static defaultProps = {
    project: undefined,
    user: undefined
  };
  state = {
    user:{},
    project:{}
  }
  componentWillReceiveProps(props) {
    this.setState({
      user: props.user,
      project: props.project
    });
  }
  render() {
    return (
      <div>
        {this.state.project ? (
          <div>
            {(() => {
              this.state.project.members = this.state.project.members || [];
              return this.state.project.members.map((member, index) => (
                <MemberDisplay member={member} project={this.state.project} key={member.uid}/>
              ));
            })()}
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}
