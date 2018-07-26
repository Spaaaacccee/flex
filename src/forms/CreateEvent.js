import TimelineEvent from "../classes/TimelineEvent";
import update from "immutability-helper";
import { Input, DatePicker, Button, Switch, Select } from "antd";
import React, { Component } from "react";
import { ObjectUtils } from "../classes/Utils";
import MemberGroupSelector from "../components/MemberGroupSelector";

export default class CreateEvent extends Component {
  state = {
    values: {
      name: "",
      description: "",
      date: Date.now(),
      autoComplete: false,
      involvedPeople: {
        members: [],
        roles: []
      },
      notify: -1
    },
    submitted: false,
    opened: false,
    project: {}
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
    this.setState({ user: props.user || {} });
    if (!props.project) return;
    if (
      props.project.projectID === this.state.project.projectID &&
      props.project.lastUpdatedTimestamp ===
        this.state.project.lastUpdatedTimestamp
    )
      return;
    this.setState({
      project: props.project
    });
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
        <h3>Involved People</h3>
        <MemberGroupSelector
          project={this.state.project}
          onSelectionChanged={selection => {
            this.setValue({ values: { involvedPeople: selection } });
          }}
        />
        <p>
          Only people involved will see this event in their feed and receive
          reminders.
        </p>
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
