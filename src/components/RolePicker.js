import React, { Component } from "react";
import { Tag, Select, Icon } from "antd";
import $ from "../classes/Utils";
import "./RolePicker.css";
import { HSL } from "../classes/Role";

/**
 * A panel to select roles out of supplied array of roles
 * @export
 * @class RolePicker
 * @extends Component
 */
export default class RolePicker extends Component {
  static defaultProps = {
    roles: [],
    onRolesChange: () => {}
  };
  state = {
    roles: [],
    availableRoles: [],
    inputVisible: false,
    selectorIsOpen: false,
    readOnly: false
  };
  componentWillReceiveProps(props) {
    this.setState({ readOnly: props.readOnly });
    if (
      JSON.stringify(this.state.roles) === JSON.stringify(props.roles) &&
      JSON.stringify(this.state.availableRoles) ===
        JSON.stringify(props.availableRoles)
    )
      return;
    this.setState({
      roles: props.roles || [],
      availableRoles: props.availableRoles || []
    });
  }
  render() {
    return (
      <div className="role-picker">
        {this.state.roles.map((item, index) => (
          <Tag
            closable={!this.state.readOnly}
            key={item.uid}
            color={HSL.toCSSColor(item.color)}
            afterClose={() => {
              this.setState(
                {
                  roles: (() => {
                    let newSelection = this.state.roles;
                    newSelection.splice(index, 1);
                    return newSelection;
                  })()
                },
                () => {
                  this.props.onRolesChange(this.state.roles);
                }
              );
            }}
          >
            {item.name.slice(0, 15) === item.name
              ? item.name
              : `${item.name.slice(0, 15)}...`}
          </Tag>
        ))}
        <span
          onMouseLeave={() => {
            if (this.state.selectorIsOpen) return;
            this.setState({ inputVisible: false });
          }}
          onClick={() => {
            this.setState({ selectorIsOpen: true });
          }}
        >
          {this.state.inputVisible && (
            <Select
              notFoundContent="Configure roles in Project Settings"
              dropdownMatchSelectWidth={false}
              ref={element => {
                this.input = element;
              }}
              onChange={item => {
                this.setState(
                  {
                    roles: (() => {
                      let newSelection = this.state.roles;
                      newSelection.push(
                        this.state.availableRoles.filter(
                          element => element.uid === item
                        )[0]
                      );
                      return newSelection;
                    })()
                  },
                  () => {
                    this.props.onRolesChange(this.state.roles);
                  }
                );
                this.setState({ inputVisible: false, selectorIsOpen: false });
              }}
              size="small"
              onBlur={() => {
                this.setState({ inputVisible: false, selectorIsOpen: false });
              }}
            >
              {this.state.availableRoles
                .filter(
                  item =>
                    !this.state.roles.find(
                      compItem => compItem.uid === item.uid
                    )
                )
                .map((item, index) => (
                  <Select.Option
                    key={item.uid}
                    value={item.uid}
                    style={{
                      color: HSL.toCSSColor(item.color)
                    }}
                  >
                    {item.name.slice(0, 15) === item.name
                      ? item.name
                      : `${item.name.slice(0, 15)}...`}
                  </Select.Option>
                ))}
            </Select>
          )}
        </span>
        {!this.state.inputVisible &&
          !this.state.readOnly && (
            <Tag
              onMouseEnter={() => {
                this.setState({ inputVisible: true }, () => {
                  this.input.focus();
                });
              }}
              onMouseUp={() => {
                this.setState({ inputVisible: true }, () => {
                  this.input.focus();
                });
              }}
              onTouchStart={() => {
                this.setState({ inputVisible: true }, () => {
                  this.input.focus();
                });
              }}
              style={{
                background: "#fff",
                borderStyle: "dashed",
                borderRightWidth: 1
              }}
            >
              <Icon type="plus" /> Add Role
            </Tag>
          )}
      </div>
    );
  }
}
