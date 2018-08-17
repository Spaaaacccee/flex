import React, { Component } from "react";
import { Card, Icon } from "antd";
import UserGroupDisplay from "./UserGroupDisplay";
import $ from "../classes/Utils";
import FileDisplay from "./FileDisplay";
import TimelineItem from "./TimelineItem";

class HistoryDisplay extends Component {
  state = { project: {}, user: {}, item: null, readOnly: false };

  componentDidMount() {
    this.setState(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({
      project: props.project,
      user: props.user,
      item: props.item,
      readOnly: props.readOnly
    });
  }

  render() {
    let item = this.state.item;
    if (!item) return <div />;
    return (
      <div>
        <Card
          actions={
            item.type === "name" ||
            item.type === "description" ||
            item.type === "project" ||
            this.state.readOnly
              ? null
              : [
                  <span
                    onClick={() => {
                      this.props.onMentionButtonPressed();
                    }}
                  >
                    <Icon type="message" />
                    {" Mention"}
                  </span>,
                  <span
                    onClick={() => {
                      this.props.onMessage({
                        type: "navigate",
                        content: (() => {
                          switch (item.type) {
                            case "member":
                              return 1;
                            case "event":
                              return 2;
                            case "set of files":
                            case "file":
                              return 4;
                            default:
                              break;
                          }
                        })()
                      });
                    }}
                  >
                    <Icon type="export" />
                    {` ${(() => {
                      switch (item.type) {
                        case "event":
                          return "Timeline";
                        case "set of files":
                        case "file":
                          return "Files";
                        case "member":
                          return "Members";
                        default:
                          break;
                      }
                    })()}`}
                  </span>
                ]
          }
        >
          <div style={{ textAlign: "center" }}>
            {
              <span>
                <UserGroupDisplay
                  style={{ display: "inline-block", marginBottom: -8 }}
                  people={{ members: [item.doneBy] }}
                  project={this.state.project}
                />
                {`${item.action} ${
                  item.type === "name" || item.type === "description"
                    ? "the project"
                    : item.type === "project"
                      ? "this"
                      : $.string(item.type.substring(0, 1)).isVowel()
                        ? "an"
                        : "a"
                } ${item.type} ${$.date(item.doneAt).humanise()}`}
              </span>
            }
          </div>
          {(() => {
            switch (item.type) {
              case "event":
                return (
                  <div>
                    <br />
                    {(this.state.project.events || []).find(
                      x => x.uid === item.content.uid
                    ) ? (
                      <TimelineItem
                        readOnly
                        user={this.state.user}
                        project={this.state.project}
                        event={this.state.project.events.find(
                          x => x.uid === item.content.uid
                        )}
                      />
                    ) : (
                      <span style={{ opacity: 0.65 }}>
                        {
                          "We can not display this event because it has been deleted."
                        }
                      </span>
                    )}
                  </div>
                );
              case "set of files":
              case "file":
                let file;
                if (item.content) {
                  file = (this.state.project.files || []).find(
                    x => x.uid === item.content.uid
                  );
                  if (!file)
                    file = (this.state.project.files || [])
                      .filter(x => x.uploadType === "cloud")
                      .find(x => x.source.id === item.content.uid);
                }
                return (
                  <div>
                    <br />
                    {file ? (
                      <FileDisplay
                        readOnly
                        project={this.state.project}
                        file={file}
                      />
                    ) : (
                      <span style={{ opacity: 0.65 }}>
                        {
                          "We can not display this file because it has been deleted."
                        }
                      </span>
                    )}
                  </div>
                );
              case "member":
                break;
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
