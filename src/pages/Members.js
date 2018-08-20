import React, { Component } from "react";
import { Tabs, List, Icon } from "antd";
import MemberDisplay from "../components/MemberDisplay";
import Columns from "react-columns";

export default class MEMBERS extends Component {
  state = {
    user: {},
    project: {}
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
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
            <Columns
              rootStyles={{ maxWidth: 950, margin: "auto" }}
              gap={10}
              queries={[
                {
                  columns: Math.min(
                    (this.state.project.members || []).length || 1,
                    2
                  ),
                  query: "min-width: 1000px"
                }
              ]}
            >
              {(this.state.project.members || []).map((member, index) => (
                <MemberDisplay
                  member={member}
                  project={this.state.project}
                  key={member.uid}
                />
              ))}
            </Columns>
          </div>
        ) : (
          ""
        )}
        <p>
          <span style={{ fontWeight: "bold" }}>
            <Icon type="user-add" /> Invite Users
          </span>
          <span> to add more members to this project</span>
        </p>
      </div>
    );
  }
}
