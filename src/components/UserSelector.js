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
    data: [], // The values given upon search by the database.
    values: undefined, // The values selected by the user. 
    fetching: false // Whether the component is currently fetching users from the database.
  };
  lastFetchID = 0;

  /**
   * Populates search results with users.
   * @param  {any} val 
   * @return {void}
   * @memberof UserSelector
   */
  fetchUser(val) {
    if (val) {
      this.lastFetchID += 1;
      const fetchID = this.lastFetchID;
      // Show the fetching animation.
      this.setState({ fetching: true,data:[] });
      // Fetch the users.
      Fetch.searchUserByEmail(val, 5).then(users => {
        // If the fetchID doesn't equal the last fetchID, it means this search is not fresh, and should return.
        if (fetchID !== this.lastFetchID) return;
        // Set the search results.
        this.setState({
          data: users || [],
          fetching: false
        });
      });
    } else {
      // If the search query is empty, then don't fetch users.
      this.setState({
        data: [],
        fetching: false
      });
    }
  }

  handleChange(values) {
    // What to do when the selected users change.
    this.setState({
      values,
      data: [],
      fetching: false
    });
    // Notify the parent component.
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
            // Populate the drop down with all suggested users.
            <Option key={d.uid}>
              <Icon type="user" /> {d.name} {`(${d.email})`}
            </Option>
          ))}
        </Select>
      </div>
    );
  }
}
