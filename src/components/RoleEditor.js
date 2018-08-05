import React, { Component } from "react";
import { ObjectUtils } from "../classes/Utils";
import Role from "../classes/Role";
import { List, Button, Input, Icon } from "antd";
import update from "immutability-helper";

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
                    <Icon type="tags" /> <br />This project has no roles.
                  </div>
                )
              }}
              itemLayout="horizontal"
              size="large"
              dataSource={this.state.values}
              renderItem={(item, index) => (
                <List.Item
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
                  <div
                    style={{
                      width: 35,
                      marginRight: 10,
                      borderRadius: 50,
                      backgroundColor: `hsl(${item.color.hue},${
                        item.color.saturation
                      }%,${item.color.lightness}%)`,
                      border: "7px solid white"
                    }}
                  />
                  <Input
                    value={this.state.values[index].name}
                    placeholder="New Role"
                    onChange={e => {
                      this.setState(
                        update(this.state, {
                          values: {
                            [index]: {
                              name: { $set: e.target.value || "New Role" }
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
