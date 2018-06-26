import {IDGen} from './Utils';
import Fetch from './Fetch';

export default class Project {
    
    static async exists(projectID) {
        return (await (await Fetch.getProjectReference(projectID)).once('value')).exists();
      }

    static async get(projectID) {
        return await Fetch.getProject(projectID);
    }

    static async update(projectID, project) {
        try {
            if (project instanceof Project) {
              project = Object.assign((await Project.get(projectID)),project);
              project.lastUpdatedTimestamp = Date.now();
              (await Fetch.getProjectReference(projectID)).set(project);
              return true;
            }
          } catch (e) {
            console.log(e);
          }
          return false;
    }

    static async delete(projectID) {}

    projectID;
    name;
    thumbnail;
    profileImage;
    lastUpdatedTimestamp;

    members;
    roles;

    async addMember() {}

    async removeMember() {}

    /**
     * Create a new project object
     * @param {string} name Set a name for this new project
     */
    constructor(name) {
        this.name = name||null;
        this.projectID = IDGen.generateUID();
        this.lastUpdatedTimestamp = Date.now();
    }
}