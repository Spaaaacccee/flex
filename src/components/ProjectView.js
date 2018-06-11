import React, { Component } from "react";
import propTypes from "prop-types";
import { Layout, Card, Icon, Avatar } from "antd";
import TopBar from "./TopBar";
import  ProjectSider from "./ProjectSider";
import "./ProjectView.css";
const { Header, Footer, Sider, Content } = Layout;
const { Meta } = Card;

export default class ProjectView extends Component {
  static propTypes = {
    projectID: propTypes.string,
    onNavButtonPress: propTypes.func,
    onContentPress: propTypes.func,
    onNavDrag:propTypes.func,
    navigationCollapsed: propTypes.bool,
    style: propTypes.any
  };

  static defaultProps = {
    projectID: "",
    onNavButtonPress: () => {},
    onContentPress: ()=>{},
    onNavDrag:()=>{},
    navigationCollapsed: true,
    style: {}
  };

  state = {
    navigationCollapsed: true,
    siderWidth: 200
  };
  componentWillReceiveProps(props) {
    this.setState({
      navigationCollapsed: props.navigationCollapsed ? true : false,
      style:props.style||this.state.style
    });
  }

  render() {
    return (
      <div
          style={{
          flex: 1,
          height: "100%"
        }}
      >
        <Layout className="project-view-wrapper" style={this.state.style}>
          <Sider className="project-view-sider" width={this.state.siderWidth}>
            <ProjectSider onItemSelected={()=>{
              this.props.onContentPress();
            }}
            />
          </Sider>
          <Layout
              className="project-view-content"
              style={{
              transform:
                "translateX(" + (this.state.navigationCollapsed
                  ? this.state.siderWidth * -1
                  : 0) + "px)"
            }}
          >
            <TopBar
                style={{
                height: "56px",
                flex: 0
              }}
                onLeftButtonPress={() => {
                this.props.onNavButtonPress();
              }}
                navButtonType="menu"
                heading="Heading"
            />
            <Content 
                className="project-view-inner-content"
                onTouchStart={(e)=>{
                  this.props.onContentPress();

                  //handle touch gesture
                  var threshold = 70;
                  var leftThreshold = 100;
                  var timeLimit = 200;

                  if (e.touches[0].clientX > leftThreshold) return;

                  var initialTouch = e.touches[0].clientX;
                  var fn = (e) => {
                    if(e.touches[0].clientX - initialTouch >= threshold) {
                      this.props.onNavDrag();
                      endFn();
                    }
                  };

                  var endFn = (e) => {
                    window.removeEventListener("touchmove",fn);
                    window.removeEventListener("touchend",endFn);
                  };

                  window.addEventListener("touchmove",fn);
                  window.addEventListener("touchend",endFn);
                  
                  setTimeout(endFn,timeLimit);
                  }}
                onMouseUp={()=>{this.props.onContentPress();}}
            >
              <div>
                <Card
                    style={{
                    width: "100%",
                    maxWidth: 300,
                    display: "inline-block",
                    marginBottom: 20
                  }}
                    cover={
                    <img
                        alt="example"
                        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                    />
                  }
                    actions={[
                    <Icon type="setting" />,
                    <Icon type="edit" />,
                    <Icon type="ellipsis" />
                  ]}
                >
                  <Meta
                      avatar={
                      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                    }
                      title="Card title"
                      description="This is the description"
                  />
                </Card>
                <Card
                    style={{
                    width: "100%",
                    maxWidth: 300,
                    display: "inline-block",
                    marginBottom: 20
                  }}
                    cover={
                    <img
                        alt="example"
                        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                    />
                  }
                    actions={[
                    <Icon type="setting" />,
                    <Icon type="edit" />,
                    <Icon type="ellipsis" />
                  ]}
                >
                  <Meta
                      avatar={
                      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                    }
                      title="Card title"
                      description="This is the description"
                  />
                </Card>
                <Card
                    style={{
                    width: "100%",
                    maxWidth: 300,
                    display: "inline-block",
                    marginBottom: 20
                  }}
                    cover={
                    <img
                        alt="example"
                        src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"
                    />
                  }
                    actions={[
                    <Icon type="setting" />,
                    <Icon type="edit" />,
                    <Icon type="ellipsis" />
                  ]}
                >
                  <Meta
                      avatar={
                      <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                    }
                      title="Card title"
                      description="This is the description"
                  />
                </Card>
              </div>
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}
