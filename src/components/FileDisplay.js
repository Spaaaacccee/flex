import React, { Component } from "react";
import { Card, Icon, Button, List } from "antd";
import { ArrayUtils } from "../classes/Utils";
import UserGroupDisplay from "./UserGroupDisplay";
class FileDisplay extends Component {
  state = {
    project: {},
    file: {}
  };

  componentWillReceiveProps(props) {
    this.setState({ project: props.project, file: props.file });
  }

  render() {
    return (
      <div style={{ textAlign: "left" }}>
        {
          <Card
            style={{ maxWidth: 500 }}
            cover={
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
                <Icon type="file" style={{ fontSize: 24, color: "white" }} />
                <div style={{ height: 10 }} />
                <p style={{ color: "white" }}>No preview available.</p>
              </div>
            }
            actions={[<Icon type="download" />, <Icon type="ellipsis" />]}
          >
            {this.state.file.uid ? (
              <Card.Meta
                title={this.state.file.name}
                avatar={
                  <Icon
                    style={{
                      fontSize: 24,
                      margin: 5,
                      marginLeft: 0
                    }}
                    type="file"
                  />
                }
                description={
                  <div>{`${this.state.file.files.length} versions`}</div>
                }
                /*
                description={
                  <div>
                    <div>
                      <h3>Versions</h3>
                      {` `}
                      {this.state.file.files.length}
                    </div>
                    <div>
                      <h3>Uploaded</h3>
                      {` `}
                      {new Date(
                        Math.max(
                          ...ArrayUtils.select(
                            this.state.file.files,
                            item => item.dateUploaded
                          )
                        )
                      ).toDateString()}
                    </div>
                    <div>
                      <h3>Uploader</h3>
                      {` `}
                      <UserGroupDisplay
                        project={this.state.project}
                        people={{
                          members: ArrayUtils.select(
                            this.state.file.files,
                            item => item.uploader
                          )
                        }}
                      />
                    </div>
                  </div>
                }
              */
              />
            ) : (
              <Icon type="loading" />
            )}
            {this.state.file.files ? (
              <div>
              <br/>
              <List bordered>
                {this.state.file.files.sort((a, b) => (a.dateModified === b.dateModified ? 0 : a.dateModified > b.dateModified ? 1 : -1)).map((item, index) => (
                  <List.Item key={index} actions={[<Icon type="download"/>]}>
                    <List.Item.Meta
                      title={`Version ${index+1}`}
                      description={
                        <div>
                          {[
                            `${new Date(item.dateUploaded).toLocaleDateString()} ${new Date(item.dateUploaded).toLocaleTimeString()}`,
                            `${item.size} bytes`
                          ].map((x,i)=> <div key={i}>{x}</div>)}
                          <div>
                            <UserGroupDisplay
                              people={{ members: [item.uploader] }}
                            />
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                ))}
              </List>
              </div>
            ) : (
              <Icon type="loading" />
            )}
          </Card>
        }
        <br />
      </div>
    );
  }
}

export default FileDisplay;
