import {IDGen} from './Utils';
import Fetch from './Fetch';

export default class Role {
    uid;
    name;
    constructor(name) {
        this.uid = IDGen.generateUID();
        this.name = name;
    }
}