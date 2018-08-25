import React, { Component } from "react";
import { Tabs, List, Icon } from "antd";
import MemberDisplay from "../components/MemberDisplay";
import Columns from "react-columns";
import SendInvite from "../components/SendInvite";

export default class MEMBERS extends Component {
  state = {
    user: {},
    project: {},
    inviteModalVisible: false
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

  onExtrasButtonPress() {
    this.setState({ inviteModalVisible: true });
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
        <SendInvite
        project={this.state.project}
        visible={this.state.inviteModalVisible}
        onClose={() => {
          this.setState({ inviteModalVisible: false });
        }}
        onSend={() => {
          this.setState({ inviteModalVisible: false });
        }}
      />
      </div>
    );
  }
}
