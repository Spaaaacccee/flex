import React, { Component } from "react";
import { ObjectUtils } from "../classes/Utils";
import Role from "../classes/Role";
import { List, Button, Input, Icon } from "antd";

export default class RoleEditor extends Component {
  static defaultProps = {
    onChange: () => {}
  };
  state = {
    values: {}
  };
  componentWillReceiveProps(props) {
    this.setState({ values: props.values });
  }
  render() {
    return (
      <div>
        {this.state.values.roles ? (
          <div style={{ textAlign: "center" }}>
            <List
              locale={{
                emptyText: (
                  <div>
                    <Icon type="tags" /> <br />No roles here
                  </div>
                )
              }}
              itemLayout="horizontal"
              size="large"
              dataSource={this.state.values.roles}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <a
                      onClick={() => {
                        this.setState(
                          ObjectUtils.mergeDeep(this.state, {
                            values: {
                              roles: (() => {
                                this.state.values.roles.splice(index, 1);
                                return this.state.values.roles;
                              })()
                            }
                          }),
                          this.props.onChange(this.state.values)
                        );
                      }}
                    >
                      <Icon type="close" />
                    </a>
                  ]}
                  key={index}
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
                    value={this.state.values.roles[index].name}
                    onChange={e => {
                      this.setState(
                        ObjectUtils.mergeDeep(this.state, {
                          values: {
                            roles: (() => {
                              let roles = this.state.values.roles;
                              roles[index].name = e.target.value;
                              return roles;
                            })()
                          }
                        }),
                        this.props.onChange(this.state.values)
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
                  ObjectUtils.mergeDeep(this.state, {
                    values: {
                      roles: (() => {
                        this.state.values.roles.push(new Role("New Role"));
                        return this.state.values.roles;
                      })()
                    }
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
