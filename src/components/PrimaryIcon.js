import React, { Component } from 'react';

export default class PrimaryIcon extends Component {
  props = {
    iconURL,
    icon
  }
  defaultIcon = "#EEE"
  render() {
    return (
      <div style={{
        background:icon||defaultIcon
      }}
      />
    );
  }
}
