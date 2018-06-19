import {IDGen} from './Utils';

export default class Project {
    projectID;
    name;
    thumbnail;
    profileImage;

    members;
    roles;
    /**
     * Create a new project object
     * @param {string} name Set a name for this new project
     */
    constructor(name) {
        this.name = name;
        this.projectID = IDGen.generateUID();
    }
}