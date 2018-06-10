import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Root from './components/Root';
import '../node_modules/antd/dist/antd.min.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Root />
      </div>
    );
  }
}

export default App;
