import React, { Component } from "react";
import { Card, Icon } from "antd";
import UserGroupDisplay from "./UserGroupDisplay";
import $ from "../classes/Utils";
import FileDisplay from "./FileDisplay";
import TimelineItem from "./TimelineItem";
import { HistoryItem } from "../classes/History";

/**
 * A component to display a single history item.
 * @class HistoryDisplay
 * @extends Component
 */
class HistoryDisplay extends Component {
  state = { project: {}, user: {}, item: null, readOnly: false };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Update this component with new properties.
    this.setState({
      project: props.project,
      user: props.user,
      item: props.item,
      readOnly: props.readOnly
    });
  }

  render() {
    let item = this.state.item;
    // If there's no item to render, then just return an empty div.
    if (!item) return <div />;
    return (
      <div>
        <Card
          actions={
            this.state.readOnly
              ? // If component is set to read only, display no options.
                null
              : [
                  // Otherwise, display an option to mention this history item.
                  [
                    <span
                      onClick={() => {
                        this.props.onMentionButtonPressed();
                      }}
                    >
                      <Icon type="message" />
                      {" Mention"}
                    </span>
                  ],
                  // If the type of this history item is not name, description, project, or roles, then display an option to go to their associated page.
                  ...(!(item.type === "name" || item.type === "description" || item.type === "project" || item.type === "roles")
                    ? [
                        <span
                          onClick={() => {
                            // Go to the relevant page for the type of item that is displayed.
                            this.props.onMessage({
                              type: "navigate",
                              content: {
                                ["event"]: 2,
                                ["set of files"]: 4,
                                ["file"]: 4,
                                ["member"]: 1
                              }[item.type]
                            });
                          }}
                        >
                          <Icon type="export" />
                          {
                            // Display a relevant name for the navigate button depending on the type of item that is displayed.
                            {
                              ["event"]: " Timeline",
                              ["set of files"]: " Files",
                              ["file"]: " Files",
                              ["member"]: " Members"
                            }[item.type]
                          }
                        </span>
                      ]
                    : [])
                ]
          }
        >
          <div style={{ textAlign: "center" }}>
            {/* Display a description about this change. */}
            <span>
              <UserGroupDisplay
                style={{ display: "inline-block", marginBottom: -8 }}
                people={{ members: [item.doneBy] }}
                project={this.state.project}
              />
              {HistoryItem.getDescription(item, true, false, this.state.user)}
            </span>
          </div>
          {(() => {
            // Display a relevant item preview.
            switch (item.type) {
              case "event":
                // If the item is an event, display an event preview.
                return (
                  <div>
                    <br />
                    {(this.state.project.events || []).find(x => x.uid === item.content.uid) ? (
                      <TimelineItem
                        readOnly
                        user={this.state.user}
                        project={this.state.project}
                        event={this.state.project.events.find(x => x.uid === item.content.uid)}
                      />
                    ) : (
                      <div style={{ opacity: 0.65, margin: "auto", textAlign: "center" }}>
                        {"We can not display this event because it has been deleted."}
                      </div>
                    )}
                  </div>
                );
              // If the item is a file, display a file preview
              case "set of files":
              case "file":
                let file;
                if (item.content) {
                  file = (this.state.project.files || []).find(x => x.uid === item.content.uid);
                  if (!file)
                    file = (this.state.project.files || [])
                      .filter(x => x.uploadType === "cloud")
                      .find(x => x.source.id === item.content.uid);
                }
                return (
                  <div>
                    <br />
                    {file ? (
                      <FileDisplay readOnly project={this.state.project} file={file} />
                    ) : (
                      // If the file cannot be found, display a message
                      <div style={{ opacity: 0.65, margin: "auto", textAlign: "center" }}>
                        {"We can not display this file because it has been deleted."}
                      </div>
                    )}
                  </div>
                );
              default:
                break;
            }
          })()}
        </Card>
      </div>
    );
  }
}

export default HistoryDisplay;
