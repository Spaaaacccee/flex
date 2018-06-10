import React, {Component} from 'react';
import propTypes from 'prop-types';
import {Layout, Card, Icon, Avatar} from 'antd';
import TopBar from './TopBar';
import './ProjectView.css';
const {Header, Footer, Sider, Content} = Layout;
const {Meta} = Card;

export default class ProjectView extends Component {
  static propTypes = {
    projectID: propTypes.string,
    onNavButtonPress: propTypes.func,
    navigationCollapsed: propTypes.bool
  }

  static defaultProps = {
    projectID: "",
    onNavButtonPress: () => {},
    navigationCollapsed: true
  }

  state = {
    navigationCollapsed: true,
    siderWidth: 200
  }
  componentWillReceiveProps(props) {
    this.setState({
      navigationCollapsed: props.navigationCollapsed
        ? true
        : false
    });
  }

  render() {
    return (
      <div style={{
        flex: 1,
        height: '100%'
      }}
      >
        <Layout className="project-view-wrapper">
          <Sider
              className="project-view-sider"
              width={this.state.navigationCollapsed
            ? 0
            : this.state.siderWidth}
          >In-project Navigation</Sider>
          <Layout className="project-view-content">
            <TopBar
                style={{
              height: '56px'
            }}
                onLeftButtonPress={() => {
              this
                .props
                .onNavButtonPress();
            }}
                navButtonType="menu"
                heading="Heading"
            />
            <Content className="project-view-inner-content">
              <div>
                <Card
                    style={{
                  width: '100%',
                  maxWidth: 300,
                  display: 'inline-block',
                  marginBottom:20
                }}
                    cover={< img alt = "example" src = "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                    actions={[ < Icon type = "setting" />, < Icon type = "edit" />, < Icon type = "ellipsis" />
                ]}
                >
                  <Meta
                      avatar={< Avatar src = "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                      title="Card title"
                      description="This is the description"
                  />
                </Card>
                <Card
                    style={{
                  width: '100%',
                  maxWidth: 300,
                  display: 'inline-block',
                  marginBottom:20
                }}
                    cover={< img alt = "example" src = "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                    actions={[ < Icon type = "setting" />, < Icon type = "edit" />, < Icon type = "ellipsis" />
                ]}
                >
                  <Meta
                      avatar={< Avatar src = "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                      title="Card title"
                      description="This is the description"
                  />
                </Card>
                <Card
                    style={{
                  width: '100%',
                  maxWidth: 300,
                  display: 'inline-block',
                  marginBottom:20
                }}
                    cover={< img alt = "example" src = "https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                    actions={[ < Icon type = "setting" />, < Icon type = "edit" />, < Icon type = "ellipsis" />
                ]}
                >
                  <Meta
                      avatar={< Avatar src = "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
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
