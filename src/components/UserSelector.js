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
    onValueChanged:()=>{}
  }
  state = {
    data: [],
    values: undefined,
    fetching: false
  };
  fetchUser(values) {
    this.setState({  data: [], fetching: true });
    Fetch.searchUserByEmail(values, 5).then(users => {
      console.log(users);
      this.setState({
        data: users || [],
        fetching: false
      });
    });
  }
  handleChange(values) {
    this.setState({
      values: values,
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
