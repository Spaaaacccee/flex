import React, { Component } from "react";
import MemberDisplay from "../components/MemberDisplay";
import Columns from "react-columns";
import SendInvite from "../components/SendInvite";

/**
 * Page for listing the members of a project.
 * @export
 * @class MEMBERS
 * @extends Component
 */
export default class MEMBERS extends Component {
  state = {
    user: {}, // The current user.
    project: {}, // The source project.
    inviteModalVisible: false // Whether the invite users window is visible.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Update this component with new properties.
    this.setState({
      user: props.user,
      project: props.project
    });
  }

  onExtrasButtonPress() {
    // Display the invite users window when the extras button is pressed.
    this.setState({ inviteModalVisible: true });
  }

  render() {
    return (
      <div>
        {this.state.project ? (
          // If project is undefined, display nothing.
          <div>
            <Columns
              rootStyles={{ maxWidth: 950, margin: "auto" }}
              gap={10}
              queries={[
                {
                  columns: Math.min((this.state.project.members || []).length || 1, 2),
                  query: "min-width: 1000px"
                }
              ]}
            >
              {(this.state.project.members || []).map(member => (
                // Display every member.
                <MemberDisplay member={member} project={this.state.project} key={member.uid} />
              ))}
            </Columns>
          </div>
        ) : (
          ""
        )}
        {/* The send invite window */}
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
