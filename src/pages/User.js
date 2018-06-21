import React, { Component } from 'react';

import Fire from '../classes/Fire';

import UserIcon from '../components/UserIcon';

import {Button} from 'antd';

export default class Page_User extends Component {
  render() {
    return (
        <div>
        <UserIcon thumbnail={Fire.firebase().auth().currentUser?Fire.firebase().auth().currentUser.photoURL:''}/> {
        }
        <Button onClick={()=>{
            Fire.firebase().auth().signOut();
            window.location.reload(true);
        }}>
            Sign Out
        </Button>
    </div>
    );
  }
};
