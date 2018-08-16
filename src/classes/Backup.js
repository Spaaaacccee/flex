import User from "./User";
import $ from "./Utils";
import Messages from "./Messages";

export default class Backup {
  static async backupProject(projectID, project) {
    let user = await User.getCurrentUser();
    Backup.mergeRepo("projects", {
      [projectID]: {
        [Date.now()]: await new Backup({
          madeBy: user.uid,
          sourceProject: project
        }).snapshotMessages()
      }
    });
  }

  static async mergeRepo(path, object) {
    localStorage.setItem(
      path,
      JSON.stringify(
        $.object(JSON.parse(localStorage.getItem(path) || "{}")).mergeDeep(
          object
        )
      )
    );
  }

  madeBy;
  sourceProject;
  sourceMessages = {};

  /**
   * Creates an instance of Backup.
   * @param  {Backup} args
   * @memberof Backup
   */
  constructor(args) {
    Object.assign(this, args);
  }

  async snapshotMessages() {
    let messenger = await Messages.get(
      this.sourceProject.messengerID || this.sourceProject.projectID
    );
    if (messenger) {
      this.sourceMessages = messenger.messages;
    }
    return this;
  }
}
