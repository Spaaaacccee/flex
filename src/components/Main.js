import React, { Component } from 'react';
import {Layout} from 'antd';

import ProjectView from './ProjectView';
import ProjectNavigation from './ProjectNavigation';
import SignIn from './SignIn';

const { Header, Footer, Sider, Content } = Layout;

export default class Main extends Component {
  state = {
    openedProjectID: undefined,
    navigationCollapsed: true,
    siderWidth: 64,
    breakpoint:1024,
    currentlyWidescreen:false
  }

  componentDidMount() {
    this.relayout();
    window.addEventListener("resize",this.relayout.bind(this));
  }

  relayout() {
    this.setState(
      window.innerWidth >= this.state.breakpoint?
      {
        navigationCollapsed:false,
        currentlyWidescreen:true
      }:
      {
        navigationCollapsed:true,
        currentlyWidescreen:false
      }
    );
  }

  render() {
    return (
      <div style={{height:'100%'}} className={this.state.currentlyWidescreen?"widescreen":""}>
            <Layout>
                <Sider width={this.state.navigationCollapsed?0:this.state.siderWidth} style={{overflow: 'auto', height: '100vh',background:'#d9dbdd'}}>
                  <ProjectNavigation userID="" onProjectChanged={()=>{}}/>
                </Sider>
                <ProjectView style={{height:'100%'}} navigationCollapsed={this.state.navigationCollapsed} onNavButtonPress={()=>{
                  this.setState({navigationCollapsed:!this.state.navigationCollapsed});
                }}projectID=""
                />
            </Layout>
      </div>
    );
  }
}
