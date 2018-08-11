import React, { Component } from "react";
import Role from "../classes/Role";
import { List, Button, Input, Icon, Popover } from "antd";
import update from "immutability-helper";
import {HuePicker} from 'react-color';

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
                style={{
                  alignItems:'center'
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
                <Popover trigger="click" placement="topLeft" content={
                  <HuePicker color={this.state.values[index].color} onChangeComplete={(c)=>{
                    this.setState(
                      update(this.state, {
                        values: {
                          [index]: {
                            color: {h:{ $set: c.hsl.h }}
                          }
                        }
                      }),
                      () => {
                        this.props.onChange(this.state.values);
                      }
                    );
                  }}/>
                }>
                <div
                style={{
                  transition:'background-color 0.3s ease',
                  width: 35,
                  marginRight: 10,
                  borderRadius: 50,
                  backgroundColor: `hsl(${item.color.h},${
                    item.color.s
                  }%,${item.color.l}%)`,
                  border: "7px solid white"
                }}
              />
              </Popover>
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
