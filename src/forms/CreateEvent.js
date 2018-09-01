import update from "immutability-helper";
import { Input, DatePicker, Button, Switch, Select, Popconfirm } from "antd";
import React, { Component } from "react";
import MemberGroupSelector from "../components/MemberGroupSelector";
import Moment from "moment";
import UserGroupDisplay from "../components/UserGroupDisplay";
import User from "../classes/User";

/**
 * A 
 * @export
 * @class CreateEvent
 * @extends Component
 */
export default class CreateEvent extends Component {

  state = {
    creator: null, // The creator of this event.
    values: {
      name: "Untitled Event", // The name of this event.
      description: "", // The description of this event.
      date: Moment.now(), // The date of this event. Defaults to the current time.
      autoComplete: false, // Whether the event is set to autocomplete itself after the time passes.
      involvedPeople: {
        members: [], // The members that are involved in this event.
        roles: [] // The roles that are involved in this event.
      },
      notify: -1, // When to notify the involved people. -1 signifies to never notify.
      markedAsCompleted: false // Whether this event is marked as completed.
    },
    submitted: false, // Whether this form is submitted.
    opened: false, // Whether this form is opened.
    project: {}, // The project this event is from.
    mode: "create" // Whether this form is meant to edit an existing event. "edit" | "create"
  };

  handleSubmit() {
    this.setState(
      {
        submitted: true
      },
      () => {
        if (this.state.mode === "create") {
          // If the mode is set to create, then notify the parent component of submission.
          this.props.onSubmit(this.state);
        } else {
          // Otherwise, update the existing event.
          User.getCurrentUser().then(user => {
            this.props.onSubmit(
              update(this.state, {
                values: { lastModifiedBy: { $set: user.uid } }
              })
            );
          });
        }
      }
    );
  }

  handleDelete() {
    this.setState({ submitted: true }, () => {
        // Notify the parent component of the deletion.
        this.props.onDelete();
    });
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  shouldComponentUpdate(props, state) {
    if (this.state.submitted !== state.submitted) return true;
    if (this.state.opened !== props.opened) return true;
    // Don't update anything unless the form was just opened/closed.
    return false;
  }

  componentWillReceiveProps(props) {
    if (this.state.opened !== props.opened) {
      // If the form just opened or just closed, then reset the form.
      this.setState(
        {
          creator: (props.values || {}).creator || null,
          lastEditor: (props.values || {}).lastModifiedBy || null,
          submitted: false,
          mode: props.mode || "create",
          opened: props.opened,
          user: props.user || {},
          project: props.project || {}
        },
        () => {
          // If the mode is set to edit, reset the input values too.
          if (props.mode === "edit" && props.values) {
            this.setValues(props.values);
          }
        }
      );
    }
  }

  /**
   * Reset the values of every input to match an object.
   * @param  {any} values 
   * @return {void}
   * @memberof CreateEvent
   */
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

  /**
   * Reference to the name text field
   * @memberof CreateEvent
   */
  nameField;
  /**
   * Reference to the description text field
   * @memberof CreateEvent
   */
  descriptionField;
  /**
   * Reference to the date field
   * @memberof CreateEvent
   */
  dateField;
  /**
   * Reference to the involved people field.
   * @memberof CreateEvent
   */
  peopleField;
  /**
   * Reference to the notify field.
   * @memberof CreateEvent
   */
  notifyField;
  /**
   * Reference to the auto complete field.
   * @memberof CreateEvent
   */
  autoCompleteField;
  /**
   * Reference to the marked as completed field.
   * @memberof CreateEvent
   */
  markedAsCompletedField;

  render() {
    return (
      <div>
        <h2 style={{ marginBottom: 20 }}>
          {this.state.mode === "edit" ? "Event" : "New Event"}
        </h2>
        <div style={{ display: this.state.mode === "edit" ? "block" : "none" }}>
          <div>
            {this.state.creator ? (
              <p style={{ display: "inline-block", marginRight: 10 }}>
                Creator:{" "}
                <UserGroupDisplay
                  project={this.state.project}
                  style={{ display: "inline-block" }}
                  people={{ members: [this.state.creator] }}
                />
                <br />
              </p>
            ) : (
              ""
            )}
            {this.state.lastEditor ? (
              <p style={{ display: "inline-block", marginRight: 10 }}>
                Last edited by:{" "}
                <UserGroupDisplay
                  project={this.state.project}
                  style={{ display: "inline-block" }}
                  people={{ members: [this.state.lastEditor] }}
                />
                <br />
              </p>
            ) : (
              ""
            )}
          </div>
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
          maxLength={100}
          style={{ marginBottom: 10 }}
          onChange={e => {
            this.setState(
              update(this.state, {
                values: { name: { $set: e.target.value.trim() || "Untitled Event" } }
              })
            );
          }}
          placeholder="Untitled Event"
          ref={e => (this.nameField = e)}
        />
        <p style={{ textAlign: "right", opacity: 0.65 }}>
          100 characters limit
        </p>
        <h3>Description</h3>
        <Input.TextArea
          maxLength={2000}
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
        <p style={{ textAlign: "right", opacity: 0.65 }}>
          2000 characters limit
        </p>
        <h3>Date</h3>
        <div>
          <DatePicker
            allowClear={false}
            style={{ marginBottom: 10 }}
            onChange={date => {
              this.setState(
                update(this.state, {
                  // Update the state with the numeric value of the selected date
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
                // Update the state with the selected people.
                values: { involvedPeople: { $set: people } }
              })
            );
          }}
          ref={e => (this.peopleField = e)}
        />
        <p>
          People involved will see this event in their feed and receive
          reminders. You will always receive reminders for events you create.
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
