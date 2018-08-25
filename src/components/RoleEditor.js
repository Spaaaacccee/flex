import React, { Component } from "react";
import Role, { HSL } from "../classes/Role";
import { List, Button, Input, Icon, Popover } from "antd";
import update from "immutability-helper";
import { HuePicker } from "react-color";
import $ from "../classes/Utils";

/**
 * A panel to edit roles of a project
 * @export
 * @class RoleEditor
 * @extends Component
 */
export default class RoleEditor extends Component {
  static defaultProps = {
    onChange: () => {}
  };
  state = {
    values: {} // The roles to edit.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Update this component to match its state.
    this.setState({ values: props.values });
  }

  /**
   * The text fields of the roles
   * @type {Input[]}
   * @memberof RoleEditor
   */
  inputRefs = [];

  render() {
    this.inputRefs = [];
    return (
      <div>
        {this.state.values ? (
          <div style={{ textAlign: "center" }}>
            <List
              // If no roles are created, display a default message.
              locale={{
                emptyText: (
                  <div>
                    <Icon type="tags" /> <br />
                    This project has no roles.
                  </div>
                )
              }}
              itemLayout="horizontal"
              size="large"
              dataSource={this.state.values}
              renderItem={(item, index) => (
                <List.Item
                  style={{
                    alignItems: "center"
                  }}
                  actions={[
                    // A delete button
                    <a
                      onClick={() => {
                        // Remove this role from the list.
                        this.setState(
                          update(this.state, {
                            values: { $splice: [[index, 1]] }
                          }),
                          () => {
                            // Notify the parent of this change.
                            this.props.onChange(this.state.values);
                          }
                        );
                      }}
                    >
                      <Icon type="close" />
                    </a>
                  ]}
                  key={item.uid}
                >
                  <Popover
                    trigger="click"
                    placement="topLeft"
                    content={
                      // A hue picker to pick the colour of the role.
                      <HuePicker
                        color={this.state.values[index].color}
                        onChangeComplete={c => {
                          this.setState(
                            // Set the colour of this role.
                            update(this.state, {
                              values: {
                                [index]: {
                                  color: { h: { $set: c.hsl.h } }
                                }
                              }
                            }),
                            () => {
                              // Notify the parent about this change.
                              this.props.onChange(this.state.values);
                            }
                          );
                        }}
                      />
                    }
                  >
                    <div
                      style={{
                        flex: "none",
                        cursor: "pointer",
                        transition: "background-color 0.3s ease",
                        width: 30,
                        height: 30,
                        marginRight: 10,
                        borderRadius: 60,
                        backgroundColor: HSL.toCSSColour(item.color),
                        border: "7px solid white"
                      }}
                    />
                  </Popover>
                  {/* The text field for the name of the role */}
                  <Input
                    maxLength={100}
                    ref={e => (this.inputRefs[index] = e)}
                    // Trim whitespace on the left or reset the field to "New Role" to ensure the field always contains a valid value.
                    onBlur={e => {
                      this.setState(
                        update(this.state, {
                          values: {
                            [index]: {
                              name: {
                                $set: e.target.value.trim() || "New Role"
                              }
                            }
                          }
                        }),
                        () => {
                          // Inform the parent component of this change.
                          this.props.onChange(this.state.values);
                        }
                      );
                    }}
                    value={this.state.values[index].name}
                    placeholder="New Role"
                    onChange={e => {
                      this.setState(
                        // Set the role name in the list of roles.
                        update(this.state, {
                          values: {
                            [index]: {
                              name: {
                                $set: $.string(e.target.value).trimLeft()
                              }
                            }
                          }
                        }),
                        () => {
                          // Inform the parent aboout this change.
                          this.props.onChange(this.state.values);
                        }
                      );
                    }}
                  />
                </List.Item>
              )}
            />
            {/* Add a role button */}
            <Button
              type="primary"
              icon="plus"
              onClick={() => {
                this.setState(
                  update(this.state, {
                    values: { $push: [new Role("")] }
                  }),
                  () => {
                    this.inputRefs[this.inputRefs.length - 1].focus();
                    this.props.onChange(this.state.values);
                  }
                );
              }}
            >
              Role
            </Button>
          </div>
        ) : (
          // Display a loding icon while the list of roles loads.
          <div style={{ textAlign: "center" }}>
            <Icon type="loading" style={{ fontSize: 24 }} spin />
          </div>
        )}
      </div>
    );
  }
}
