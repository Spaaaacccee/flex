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
    values: {}
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({ values: props.values });
  }
  render() {
    return (
      <div>
        {this.state.values ? (
          <div style={{ textAlign: "center" }}>
            <List
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
                    <a
                      onClick={() => {
                        this.setState(
                          update(this.state, {
                            values: { $splice: [[index, 1]] }
                          }),
                          () => {
                            this.props.onChange(this.state.values);
                          }
                        );
                      }}
                    >
                      <Icon type="close" />
                    </a>
                  ]}
                  key={item.uid + index}
                >
                  <Popover
                    trigger="click"
                    placement="topLeft"
                    content={
                      <HuePicker
                        style={{ maxWidth: "calc(100vw - 50px)" }}
                        color={this.state.values[index].color}
                        onChangeComplete={c => {
                          this.setState(
                            update(this.state, {
                              values: {
                                [index]: {
                                  color: { h: { $set: c.hsl.h } }
                                }
                              }
                            }),
                            () => {
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
                        height:30,
                        marginRight: 10,
                        borderRadius: 60,
                        backgroundColor: HSL.toCSSColor(item.color),
                        border: "7px solid white"
                      }}
                    />
                  </Popover>
                  <Input
                    // Trim whitespace on the left or reset the field to "New Role" to ensure the field always contains a valid value.
                    onBlur={e => {
                      this.setState(
                        update(this.state, {
                          values: {
                            [index]: {
                              name: { $set: e.target.value.trim() || "New Role" }
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
                          this.props.onChange(this.state.values);
                        }
                      );
                    }}
                  />
                </List.Item>
              )}
            />
            <Button
              type="primary"
              icon="plus"
              onClick={() => {
                this.setState(
                  update(this.state, {
                    values: { $push: [new Role("New Role")] }
                  }),
                  () => {
                    this.props.onChange(this.state.values);
                  }
                );
              }}
            >
              Role
            </Button>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <Icon type="loading" style={{ fontSize: 24 }} spin />
          </div>
        )}
      </div>
    );
  }
}
