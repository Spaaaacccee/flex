import React, { Component } from "react";
import { Card, Icon, Button, List, Avatar } from "antd";
import UserGroupDisplay from "./UserGroupDisplay";
import Fire from "../classes/Fire";
import Document from "../classes/Document";
class FileDisplay extends Component {
  state = {
    project: {},
    file: {},
    readOnly: false
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({
      project: props.project,
      file: props.file,
      readOnly: props.readOnly
    });
  }

  render() {
    return (
      <div style={{ textAlign: "left" }}>
        {
          <Card
            style={Object.assign(
              { maxWidth: 350 },
              this.state.file.files &&
              !this.state.file.files.find(i => i.state !== "unavailable")
                ? {
                    opacity: 0.65,
                    pointerEvents: "none"
                  }
                : {}
            )}
            /*cover={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 200,
                  background: "#3CA7FF",
                  flexDirection: "column"
                }}
              >
                {this.state.file.uploadType === "cloud" ? (
                  <div
                    style={{
                      width: "100%",
                      height: 200,
                      overflow: "hidden",
                      background: "black"
                    }}
                  >
                    <iframe
                      style={{
                        background: "white",
                        boxShadow: 'inset 0px -10px 20px -10px rgba(0, 0, 0, 0.1)'
                      }}
                      src={this.state.file.source.embedUrl}
                      width="100%"
                      height="200px"
                      frameBorder="0"
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center"
                    }}
                  >
                    <Icon
                      type="file"
                      style={{ fontSize: 24, color: "white" }}
                    />
                    <div style={{ height: 10 }} />
                    <p style={{ color: "white" }}>
                      We could not connect to previews.
                    </p>
                  </div>
                )}
              </div>
            } */
            actions={[
              <span
                onClick={() => {
                  Document.tryPreviewWindow(this.state.file);
                }}
              >
                <Icon type="export" />
                {" Open"}
              </span>,
              ...(this.state.readOnly ? [] : [<Icon type="ellipsis" />])
            ]}
          >
            {this.state.file.uid || this.state.file.source ? (
              <Card.Meta
                title={
                  this.state.file.uploadType === "cloud"
                    ? this.state.file.source.name
                    : this.state.file.name
                }
                avatar={
                  this.state.file.uploadType === "cloud" ? (
                    <Avatar
                      shape="square"
                      style={{
                        transform: "scale(0.6)",
                        imageRendering: "crisp-edges"
                      }}
                      src={this.state.file.source.iconUrl}
                    />
                  ) : (
                    <Icon
                      style={{
                        fontSize: 24,
                        margin: 5,
                        marginLeft: 0
                      }}
                      type="file"
                    />
                  )
                }
                description={
                  this.state.file.uploadType === "cloud" ? (
                    <span>
                      <Icon type="cloud-o" />
                      {" Stored in the cloud"}
                    </span>
                  ) : (
                    <div>{`${this.state.file.files.length} versions`}</div>
                  )
                }
              />
            ) : (
              <Icon type="loading" />
            )}
            {this.state.file.uploadType !== "cloud" &&
            this.state.file.files &&
            this.state.file.files.length > 1 ? (
              <div>
                <br />
                <List bordered>
                  {this.state.file.files
                    .sort(
                      (a, b) =>
                        a.dateModified === b.dateModified
                          ? 0
                          : a.dateModified > b.dateModified
                            ? 1
                            : -1
                    )
                    .map((item, index) =>
                      (
                        <List.Item
                          key={index}
                          actions={[
                            <Button
                              icon="export"
                              shape="circle"
                              onClick={() => {
                                Document.tryPreviewWindow(item);
                              }}
                            />
                          ]}
                        >
                          <List.Item.Meta
                            title={`Version ${index + 1}`}
                            description={
                              <div>
                                {[
                                  `${new Date(
                                    item.dateUploaded
                                  ).toLocaleString()}`,
                                  `${item.size} bytes`
                                ].map((x, i) => (
                                  <div key={i}>{x}</div>
                                ))}
                                <div>
                                  <UserGroupDisplay
                                    people={{ members: [item.uploader] }}
                                  />
                                </div>
                              </div>
                            }
                          />
                        </List.Item>
                      )
                    ).reverse()}
                </List>
              </div>
            ) : (
              ""
            )}
          </Card>
        }
      </div>
    );
  }
}

export default FileDisplay;
