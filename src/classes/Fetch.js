import Project from './Project';

const projects = [
  new Project("Example Project"),
  new Project("Another Project"),
  new Project("3rd Project")
];

export default class Fetch {
  static allProjects() {
      return projects;
  }
  /**
   * Get a project using projectID
   * @param {string} id projectID
   * @returns {Project} The project object
   */
  static project(id) {
    let result = null;
    projects.forEach(element => {
        if(element.projectID===id) result = element;
    });
    return result;
  }
  static user() {}
}
