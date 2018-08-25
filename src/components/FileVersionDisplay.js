import React, { Component } from "react";
import { List, Popconfirm, Icon, Button } from "antd";
import UserGroupDisplay from "./UserGroupDisplay";
import Document from "../classes/Document";
import Humanize from "humanize-plus";

/**
 * A component to display a single version of a file.
 * @class FileVersionDisplay
 * @extends Component
 */
class FileVersionDisplay extends Component {
  static defaultProps = {
    onMentionButtonPressed: () => {}
  };

  state = {
    item: null, // The file that should be displayed.
    project: {}, // The project that the file originated from.
    sourceFile: null, // The file that this version originated from.
    readOnly: false // Whether this component is read only.
  };

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  }

  componentWillReceiveProps(props) {
    // Update this component with new properties.
    this.setState({
      item: props.item,
      project: props.project,
      readOnly: props.readOnly,
      sourceFile: props.sourceFile
    });
  }
  render() {
    let item = this.state.item;
    // If there's no item to render, then just return an empty div.
    if (!item) return <div />;
    return (
      // This component is an extension of the Ant Design list element, so we're returning a `List.Item` and not a div.
      <List.Item
        style={{ display: "flex" }}
        key={item.uid || item.source.uid}
        actions={
          this.state.readOnly
            ? [
                // Display only the preview button if the component is read only.
                <Button
                  shape="circle"
                  icon="export"
                  type="primary"
                  onClick={() => {
                    // Try to open a preview window.
                    Document.tryPreviewWindow(item);
                  }}
                />
              ]
            : [
                // Otherwise, also display a delete button with a confirmation window.
                <Popconfirm
                  title="This version will be deleted"
                  okText="OK"
                  okType="danger"
                  cancelText="Cancel"
                  onConfirm={() => {
                    // What to do when a file is selected to be deleted.
                    // Show that the file is being deleted.
                    this.setState({ deleting: true }, () => {
                      // Try to delete the file.
                      this.state.project.deleteFile(this.state.file.uid, item.uid).then(() => {
                        // If the file deletion is successful, stop showing this component as deleting.
                        this.setState({ deleting: false });
                      });
                    });
                  }}
                >
                  <Icon style={{ color: "rgb(255, 77, 79)" }} type="delete" />
                </Popconfirm>,
                // A mention button that tells the parent component that this version is mentioned.
                <a>
                  <Icon
                    type="message"
                    onClick={() => {
                      this.props.onMentionButtonPressed();
                    }}
                  />
                </a>,
                // A preview button
                <a>
                  <Icon
                    type="export"
                    onClick={() => {
                      // Try to open a preview window.
                      Document.tryPreviewWindow(item);
                    }}
                  />
                </a>
              ]
        }
      >
        {/* Display an assortment of data about the file. */}
        <List.Item.Meta
          // Display the description of the file.
          title={<span style={{ fontSize: 14 }}>{item.description || `No comments`}</span>}
          description={
            // Display the date uploaded, and file size.
            <div>
              {[`${new Date(item.dateUploaded).toLocaleString()}`, `${Humanize.fileSize(item.size)}`].map((x, i) => (
                <div key={i}>{x}</div>
              ))}
              {/* Display the user who uploaded the file. */}
              <div>
                <UserGroupDisplay people={{ members: [item.uploader] }} project={this.state.project} />
              </div>
              {/* Display the original file name */}
              {!!item.name && <div>Uploaded as {item.name}</div>}
            </div>
          }
        />
      </List.Item>
    );
  }
}

export default FileVersionDisplay;
