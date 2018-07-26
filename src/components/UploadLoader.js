import React, { Component } from "react";
import { Progress } from "antd";

export default class UploadLoader extends Component {
    static defaultProps = {
        onClose:()=>{}
    }
  state = {
    uploadTask: {},
    progress:0
  };
  componentWillReceiveProps(props) {
      this.state.uploadTask &&this.state.uploadTask.off();
    this.setState({ uploadTask: props.uploadTask },()=>{
        if(this.state.uploadTask) {
            this.state.uploadTask.on('state_changed',(snapshot)=>{
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                this.setState({
                    progress
                });
                if(progress===100) {
                    setTimeout(this.props.onClose,2500)
                }
            })
        }
    });
  }
  render() {
    return (
      <div>
        <Progress status="active" percent={this.state.progress}/>
      </div>
    );
  }
}
