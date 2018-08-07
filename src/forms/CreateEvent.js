import TimelineEvent from "../classes/TimelineEvent";
import update from "immutability-helper";
import { Input, DatePicker, Button, Switch, Select, Popconfirm } from "antd";
import React, { Component } from "react";
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
      name: "Untitled Event",
      description: "",
      date: Moment.now(),
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
    this.setState(
      {
        submitted: true
      },
      () => {
        this.props.onSubmit(this.state);
      }
    );
  }

  handleDelete() {
    this.setState({ submitted: true }, () => {
      setTimeout(() => {
        this.props.onDelete();
      }, 250);
    });
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  shouldComponentUpdate(props, state) {
    if (this.state.submitted !== state.submitted) return true;
    if (!this.state.opened && !!props.opened) return true;
    return false;
  }

  componentWillReceiveProps(props) {
    if (!this.state.opened && !!props.opened) {
      this.setState({ submitted: false });
    }
    this.setState(
      {
        mode: props.mode || "create",
        opened: props.opened,
        user: props.user || {},
        project: props.project || {}
      },
      () => {
        if (props.mode === "edit" && props.values) {
          this.setValues(props.values);
        }
      }
    );
  }

  setValues(values) {
    values.name = values.name || "";
    values.description = values.description || "";
    values.date = values.date || Moment.now();
    this.nameField.input.value = values.name;
    this.descriptionField.textAreaRef.value = values.description;
    this.dateField.picker.setState({ value: new Moment(values.date) });
    this.notifyField.rcSelect.setState({ value: [values.notify] });
    this.peopleField.setValues(values.involvedPeople);
    this.autoCompleteField.rcSwitch.setChecked(values.autoComplete);
    this.markedAsCompletedField.rcSwitch.setChecked(
      values.markedAsCompleted ||
        (values.autoComplete && values.date <= Date.now())
    );
    this.setState({ values });
  }

  nameField;
  descriptionField;
  dateField;
  peopleField;
  notifyField;
  autoCompleteField;
  markedAsCompletedField;

  render() {
    return (
      <div>
        <h2 style={{ marginBottom: 20 }}>
          {this.state.mode === "edit" ? "Edit Event" : "New Event"}
        </h2>
        <div style={{ display: this.state.mode === "edit" ? "block" : "none" }}>
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
            ref={e => (this.markedAsCompletedField = e)}
          />
          <br />
        </div>

        <h3>Name</h3>
        <Input
          style={{ marginBottom: 10 }}
          onChange={e => {
            this.setState(
              update(this.state, { values: { name: { $set: e.target.value||"Untitled Event" } } })
            );
          }}
          placeholder="Untitled Event"
          ref={e => (this.nameField = e)}
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
          ref={e => (this.descriptionField = e)}
        />
        <h3>Date</h3>
        <div>
          <DatePicker
            allowClear={false}
            style={{ marginBottom: 10 }}
            onChange={date => {
              this.setState(
                update(this.state, {
                  values: { date: { $set: date.valueOf() } }
                })
              );
            }}
            ref={e => (this.dateField = e)}
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
          ref={e => (this.peopleField = e)}
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
          ref={e => (this.notifyField = e)}
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
          ref={e => (this.autoCompleteField = e)}
        />
        <p>
          Automatically set this event to be completed after the date passes.
        </p>
        <br />
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              display: this.state.mode === "edit" ? "inline-block" : "none",
              marginRight: 10
            }}
          >
            <Popconfirm
              title="Are you sure you want to delete this event?"
              onConfirm={this.handleDelete.bind(this)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="danger">Delete</Button>
            </Popconfirm>
          </span>
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
