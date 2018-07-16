import TimelineEvent from "../classes/TimelineEvent";
import update from "immutability-helper";
import { Input, DatePicker, Button, Switch, Select } from "antd";
import React, { Component } from "react";
import { ObjectUtils } from "../classes/Utils";

export default class CreateEvent extends Component {
  state = {
    values: {
      name: "",
      description: "",
      date: Date.now(),
      autoComplete: false,
      notify: -1
    },
    submitted: false,
    opened: false
  };

  handleSubmit() {
    this.setState({
      submitted: true
    });
    this.props.onSubmit(this.state);
  }

  componentWillReceiveProps(props) {
    if (!this.state.opened && !!props.opened) {
      this.setState({
        submitted: false
      });
    }
    this.setState({ opened: props.opened });
  }

  setValue(obj) {
    update.extend("$mergeDeep", (source, target) => {
      return ObjectUtils.mergeDeep(target, source);
    });
    this.setState(update(this.state, { $mergeDeep: obj }));
  }
  render() {
    return (
      <div>
        <h2 style={{ marginBottom: 20 }}>New Event</h2>
        <h3>Name</h3>
        <Input
          style={{ marginBottom: 10 }}
          onChange={e => {
            this.setValue({ values: { name: e.target.value } });
          }}
        />
        <h3>Description</h3>
        <Input.TextArea
          style={{ marginBottom: 10 }}
          onChange={e => {
            this.setValue({ values: { description: e.target.value } });
          }}
        />
        <h3>Date</h3>
        <div>
          <DatePicker
            allowClear={false}
            style={{ marginBottom: 10 }}
            onChange={date => {
              this.setValue({ values: { date: date ? date.valueOf() : null } });
            }}
          />
        </div>
        <h3>Notify</h3>
        <Select
          defaultValue={-1}
          style={{ marginBottom: 10, width: 200 }}
          dropdownMatchSelectWidth={false}
          onChange={e => {
            this.setValue({ values: { notify: e } });
          }}
        >
          <Select.Option key={-1} value={-1}>
            Never
          </Select.Option>
          <Select.Option key={0} value={0}>
            On the day
          </Select.Option>
          <Select.Option key={1} value={1}>
            A day before
          </Select.Option>
          {[2, 3, 4, 5, 6].map(i => (
            <Select.Option
              key={i}
              value={i}
            >{`${i} days before`}</Select.Option>
          ))}
          <Select.Option key={7} value={7}>
            A week before
          </Select.Option>
        </Select>
        <h3>Complete automatically</h3>
        <Switch
          style={{ marginBottom: 10 }}
          onChange={isTrue => {
            this.setValue({ values: { autoComplete: isTrue } });
          }}
        />
        <p>
          Automatically set this event to be completed after the date passes.
        </p>
        <br />
        <div style={{ textAlign: "right" }}>
          <Button
            type="primary"
            loading={this.state.submitted}
            icon="plus"
            onClick={this.handleSubmit.bind(this)}
          >
            Create
          </Button>
        </div>
      </div>
    );
  }
}
