import TimelineEvent from "../classes/TimelineEvent";
import update from "immutability-helper";
import { Input, DatePicker, Button, Switch, Select } from "antd";
import React, { Component } from "react";
import { ObjectUtils } from "../classes/Utils";
import MemberGroupSelector from "../components/MemberGroupSelector";
import Project from "../classes/Project";
import Moment from "moment";

export default class CreateEvent extends Component {
  /**
   * @type {{mode:"create"|"edit"}}
   * @memberof CreateEvent
   */
  state = {
    values: {
      name: "",
      description: "",
      date: new Moment(Moment.now()),
      autoComplete: false,
      involvedPeople: {
        members: [],
        roles: []
      },
      notify: -1,
      markedAsCompleted: false
    },
    submitted: false,
    opened: false,
    project: {},
    mode: "create"
  };

  handleSubmit() {
    this.setState({
      submitted: true
    });
    this.props.onSubmit(
      update(this.state, { values: { date: { $apply: x => x.valueOf() } } })
    );
  }

  componentWillReceiveProps(props) {
    if (!this.state.opened && !!props.opened) {
      this.setState({
        submitted: false
      });
      if (props.mode === "edit" && props.values) {
        this.setState({
          values: Object.assign(props.values, {
            date: new Moment(props.values.date)
          })
        });
      }
    }
    this.setState({
      mode: props.mode || "create",
      opened: props.opened,
      user: props.user || {}
    });
    if (Project.equal(props.project, this.state.project)) return;
    this.setState({
      project: props.project
    });
  }

  render() {
    return (
      <div>
        <h2 style={{ marginBottom: 20 }}>
          {this.state.mode === "edit" ? "Edit Event" : "New Event"}
        </h2>
        <h3>Name</h3>
        <Input
          style={{ marginBottom: 10 }}
          onChange={e => {
            this.setState(
              update(this.state, { values: { name: { $set: e.target.value } } })
            );
          }}
          value={this.state.values.name}
        />
        <h3>Description</h3>
        <Input.TextArea
          style={{ marginBottom: 10 }}
          onChange={e => {
            this.setState(
              update(this.state, {
                values: { description: { $set: e.target.value } }
              })
            );
          }}
          value={this.state.values.description}
        />
        <h3>Date</h3>
        <div>
          <DatePicker
            allowClear={false}
            style={{ marginBottom: 10 }}
            onChange={date => {
              this.setState(
                update(this.state, { values: { date: { $set: date } } })
              );
            }}
            value={this.state.values.date}
          />
        </div>
        <h3>Involved People</h3>
        <MemberGroupSelector
          project={this.state.project}
          onSelectionChanged={people => {
            this.setState(
              update(this.state, {
                values: { involvedPeople: { $set: people } }
              })
            );
          }}
          values={this.state.values.involvedPeople}
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
            this.setState(
              update(this.state, { values: { notify: { $set: e } } })
            );
          }}
          value={this.state.values.notify}
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
          onChange={value => {
            this.setState(
              update(this.state, { values: { autoComplete: { $set: value } } })
            );
          }}
          checked={this.state.values.autoComplete}
        />
        <p>
          Automatically set this event to be completed after the date passes.
        </p>
        {this.state.mode === "edit" && (
          <div>
            <h3>Marked as completed</h3>
            <Switch
              style={{ marginBottom: 10 }}
              onChange={value => {
                this.setState(
                  update(this.state, {
                    values: { markedAsCompleted: { $set: value } }
                  })
                );
              }}
              checked={this.state.values.markedAsCompleted}
            />
          </div>
        )}
        <br />
        <div style={{ textAlign: "right" }}>
          <Button
            type="primary"
            loading={this.state.submitted}
            icon={this.state.mode === "edit" ? "check" : "plus"}
            onClick={this.handleSubmit.bind(this)}
          >
            {this.state.mode === "edit" ? "Done" : "Create"}
          </Button>
        </div>
      </div>
    );
  }
}
