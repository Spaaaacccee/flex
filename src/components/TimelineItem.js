import React, { Component } from "react";
import { Card, Icon, Button } from "antd";
import Project from "../classes/Project";
import UserGroupDisplay from "./UserGroupDisplay";

/**
 * Displays an timeline event as a card
 * @export
 * @class TimelineItem
 * @extends Component
 */
export default class TimelineItem extends Component {
  static defaultProps = {
    onComplete:()=>{},
    onEdit:()=>{}
  }
  state = {
    eventID: null, //TimelineEvent uid to display
    projectID: null, //The ID of the project to take the event info from
    project: {},
    event: {}
  };

  componentWillReceiveProps(props) {
    this.setState({ eventID: props.eventID, projectID: props.projectID });
    if (!props.projectID) return;
    Project.get(props.projectID).then(project => {
      if (!project) return;
      this.setState({ project });
      if (!props.eventID) return;
      let event = project.events.find(item => item.uid === props.eventID);
      if (event) this.setState({ event });
    });
  }

  render() {
    return (
      <div style={{ textAlign: "left" }}>
        <Card
          actions={[
            <Icon
              type="edit"
              onClick={() => {
                this.props.onEdit();
              }}
            />,
            <Icon
              type="check"
              onClick={() => {
                this.props.onComplete();
              }}
            />
          ]}
        >
          <Card.Meta
            title={this.state.event.name || <Icon type="loading" />}
            description={
              this.state.event.date ? (
                <div>
                  <div>{new Date(this.state.event.date).toDateString()}</div>
                  <div>{this.state.event.description || ""}</div>
                  <div>
                    <br />
                    <UserGroupDisplay
                      project={this.state.project}
                      people={this.state.event.involvedPeople}
                    />
                  </div>
                </div>
              ) : (
                <Icon type="loading" />
              )
            }
          />
        </Card>
      </div>
    );
  }
}
