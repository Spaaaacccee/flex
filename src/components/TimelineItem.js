import React, { Component } from "react";
import { Card, Icon } from "antd";
import Project from "../classes/Project";

/**
 * Displays an timeline event as a card 
 * @export
 * @class TimelineItem
 * @extends Component
 */
export default class TimelineItem extends Component {
  state = {
    eventID: null, //TimelineEvent uid to display
    projectID: null, //The ID of the project to take the event info from
    event: {},
  };
  componentWillReceiveProps(props) {
    this.setState({ eventID: props.eventID, projectID:props.projectID });
    if(!props.projectID) return;
    Project.get(props.projectID).then((project)=>{
        if(!props.eventID) return;
        if(!project) return;
        let event = project.events.find(item=>item.uid===props.eventID);
        if(event) this.setState({event});
    });
  }
  render() {
    return (
      <div style={{textAlign:'left'}}>
        <Card title={this.state.event.name || <Icon type="loading" />} extra={<Icon type="edit" />} >
          <Card.Meta
            description={
                this.state.event.date ? (
                new Date(this.state.event.date).toDateString()
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
