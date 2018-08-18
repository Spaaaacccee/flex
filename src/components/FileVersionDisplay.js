import React, { Component } from "react";
import { List, Popconfirm, Icon, Button } from "antd";
import UserGroupDisplay from "./UserGroupDisplay";
import Document from '../classes/Document';

class FileVersionDisplay extends Component {
  static defaultProps = {
    onMentionButtonPressed: () => {}
  };
  state = { item: null, project: {}, readOnly: false, sourceFile: null };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    this.setState({
      item: props.item,
      project: props.project,
      readOnly: props.readOnly,
      sourceFile: props.sourceFile
    });
  }
  render() {
    let item = this.state.item;
    if (!item) return <div />;
    return (
      <List.Item
        style={{ display: "flex" }}
        key={item.uid || item.source.uid}
        actions={
          this.state.readOnly
            ? [
                <Button
                  shape="circle"
                  icon="export"
                  type="primary"
                  onClick={() => {
                    Document.tryPreviewWindow(item);
                  }}
                />
              ]
            : [
                <Popconfirm
                  title="This version will be deleted"
                  okText="OK"
                  okType="danger"
                  cancelText="Cancel"
                  onConfirm={() => {
                    this.setState({ deleting: true }, () => {
                      this.state.project
                        .deleteFile(this.state.file.uid, item.uid)
                        .then(() => {
                          this.setState({ deleting: false });
                        });
                    });
                  }}
                >
                  <Icon style={{ color: "rgb(255, 77, 79)" }} type="delete" />
                </Popconfirm>,
                <a>
                  <Icon
                    type="message"
                    onClick={() => {
                      this.props.onMentionButtonPressed();
                    }}
                  />
                </a>,
                <a>
                  <Icon
                    type="export"
                    onClick={() => {
                      Document.tryPreviewWindow(item);
                    }}
                  />
                </a>
              ]
        }
      >
        <List.Item.Meta
          title={item.description || `No comments`}
          description={
            <div>
              {[
                `${new Date(item.dateUploaded).toLocaleString()}`,
                `${item.size} bytes`
              ].map((x, i) => (
                <div key={i}>{x}</div>
              ))}
              <div>
                <UserGroupDisplay
                  people={{ members: [item.uploader] }}
                  project={this.state.project}
                />
              </div>
            </div>
          }
        />
      </List.Item>
    );
  }
}

export default FileVersionDisplay;
