import React, { Component } from "react";
import { List, Icon, Card, Avatar, Popover, Button } from "antd";
import User from "../classes/User";
import Project from "../classes/Project";
import $ from "../classes/Utils";
import RolePicker from "./RolePicker";
import update from "immutability-helper";
import UserIcon from "./UserIcon";

/**
 * Displays member information in a card.
 * @export
 * @class MemberDisplay
 * @extends Component
 */
export default class MemberDisplay extends Component {
  state = {
    member: {}, // UID of the member to display
    project: {}, // The project that the member is from.
    user: {}, // User info.
    readOnly: false, // Whether this component is read only.
    cardless: false // Whether this component should be in a card.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }
  componentWillReceiveProps(props) {
    // Get a fresh copy of the user from the database
    if (props.member.uid !== this.state.member.uid) {
      User.get(props.member.uid).then(user => {
        this.setState({ user });
      });
    }
    // Set the member and project information immediately. It is ok if either of these values are null because these are handled later on
    this.setState({
      member: props.member,
      project: props.project,
      readOnly: props.readOnly,
      cardless: props.cardless
    });
  }

  shouldComponentUpdate(props, state) {
    if (state.cardless !== this.state.cardless) return true;
    if (state.readOnly !== this.state.readOnly) return true;
    // If the new properties are not different to the values in the existing state, then don't update anything.
    if (!Project.equal(props.project, this.state.project)) return true;
    if (!User.equal(this.state.user, state.user)) return true;
    if (JSON.stringify(props.member) !== JSON.stringify(this.state.member)) return true;
    return false;
  }

  render() {
    return (
      <div>
        <Card
          loading={!(this.state.user || {}).name}
          style={Object.assign(
            { textAlign: "center" },
            // If the component is carless, remove the box shadow so that it would look as if the content is by itself.
            this.state.cardless ? { background: "none", boxShadow: "none" } : {}
          )}
        >
          <Card.Meta
            title={
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700
                }}
              >
                {/* Display the user profile image */}
                <UserIcon thumbnail={this.state.user.profilePhoto} />
                <div style={{ paddingBottom: 10 }} />
                {/* Display the user name */}
                {this.state.user.name || <Icon type="loading" />}{" "}
                {this.state.user.uid &&
                  this.state.user.uid === this.state.project.owner && (
                    // If the user is the owner, display a little star.
                    <Popover content="Owner">
                      <Icon
                        type="crown"
                        theme="filled"
                        style={{
                          fontSize: 14,
                          position: "absolute",
                          padding: "0 5px",
                          color: "#1890FF"
                        }}
                      />
                    </Popover>
                  )}
              </div>
            }
            description={
              <div>
                {/* Display the user's email. */}
                {this.state.user.email || <Icon type="loading" />}
                <br />
                <br />
                {/* Display the user's roles, and allow the user to edit them. */}
                <RolePicker
                  // If the component is readonly, then don't allow the user to edit the roles.
                  readOnly={this.state.readOnly}
                  roles={(this.state.project.roles || []).filter(item =>
                    // Get the roles that the user has selected
                    $.array(this.state.member.roles || []).existsIf(x => x === item.uid)
                  )}
                  availableRoles={(this.state.project.roles || []).filter(
                    // The roles that are available are all the roles that the user hasn't selected.
                    item => !$.array(this.state.member.roles || []).exists(x => x === item.uid)
                  )}
                  onRolesChange={roles => {
                    // When the roles change, update the information locally.
                    this.setState(update(this.state, { member: { roles: { $set: roles } } }));
                    // Set the same information on the database.
                    this.state.project.setMember(this.state.member.uid, roles.map(item => item.uid));
                  }}
                />
              </div>
            }
          />
        </Card>
        <br />
      </div>
    );
  }
}
