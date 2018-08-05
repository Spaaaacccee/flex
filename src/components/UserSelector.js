import React, { Component } from "react";
import { Select, Icon } from "antd";
import Fetch from "../classes/Fetch";
const { Option } = Select;

/**
 * Find and select users by searching through the database
 * @export
 * @class UserSelector
 * @extends Component
 */
export default class UserSelector extends Component {
  static defaultProps = {
    onValueChanged: () => {}
  };
  state = {
    data: [],
    values: undefined,
    fetching: false
  };
  lastFetchID = 0;
  fetchUser(val) {
    if (val) {
      this.lastFetchID += 1;
      const fetchID = this.lastFetchID;
      this.setState({ fetching: true,data:[] });
      Fetch.searchUserByEmail(val, 5).then(users => {
        if (fetchID !== this.lastFetchID) return;
        this.setState({
          data: users || [],
          fetching: false
        });
      });
    } else {
      this.setState({
        data: [],
        fetching: false
      });
    }
  }
  handleChange(values) {
    this.setState({
      values,
      data: [],
      fetching: false
    });
    this.props.onValueChanged(values);
  }
  render() {
    return (
      <div>
        <Select
          mode="multiple"
          labelInValue
          value={this.state.values}
          placeholder="Enter a user's email address"
          onSearch={this.fetchUser.bind(this)}
          onChange={this.handleChange.bind(this)}
          notFoundContent={this.state.fetching ? <Icon type="loading" /> : null}
          filterOption={false}
          style={{ width: "100%" }}
        >
          {this.state.data.map(d => (
            <Option key={d.uid}>
              <Icon type="user" /> {d.name} {`(${d.email})`}
            </Option>
          ))}
        </Select>
      </div>
    );
  }
}
