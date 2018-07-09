import React, { Component } from "react";
import { Card, Icon } from "antd";
import Project from "../classes/Project";

export default class TimelineItem extends Component {
  state = {
    eventID: null, //TimelineEvent uid to display
    projectID: null, //The ID of the project to take the event info from
    event: {},
  };
  componentWillReceiveProps(props) {
    this.setState({ eventID: props.eventID, projectID:props.projectID });
    if(!props.projectID) return;
    Project.get(projectID).then((project)=>{
        if(!props.eventID) return;
        let event = project.events.find(item=>item.uid===props.eventID);
        if(event) this.setState({event});
    });
  }
  render() {
    return (
      <div>
        <Card extra={<Icon type="edit" />}>
          <Card.Meta
            title={event.name || <Icon type="loading" />}
            description={
              event.Date ? (
                new Date(event.date).toDateString()
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
