import {IDGen} from './Utils';
import Fetch from './Fetch';

export default class Member {
    uid;
    roles;
    constructor(uid,roles) {
        this.uid = uid;
        this.roles = roles;
    }
}