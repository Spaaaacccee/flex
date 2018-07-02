import React, { Component } from "react";
import { Select, Icon } from "antd";
import Fetch from "../classes/Fetch";
const { Option } = Select;

export default class UserSelector extends Component {
  state = {
    data: [],
    value:undefined,
    fetching: false
  };
  fetchUser(value) {
      this.setState({fetching:true});
    Fetch.getUserByEmail(value).then((user)=>{
        console.log(user);
        this.setState({
            data:user?[user]:[],
            fetching:false
        });
    });
  }
  handleChange(value) {
      this.setState({
          value:value,
          data: [],
          fetching: false,
      });
  }
  render() {
    return (
      <div>
        <Select
          mode="multiple"
          labelInValue
          value={this.state.value}
          placeholder="Enter a user's email address"
          onSearch={this.fetchUser.bind(this)}
          onChange={this.handleChange.bind(this)}
          notFoundContent={this.state.fetching ? <Icon type="loading" /> : null}
          filterOption={false}
          style={{ width: '100%' }}
        >
        {this.state.data.map(d => <Option key={d.email}>{d.uid}</Option>)}
        </Select>
      </div>
    );
  }
}
