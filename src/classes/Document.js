import Firebase from "firebase";
import Fire from "./Fire";
import { message } from "antd";
import { IDGen, ObjectUtils, EventEmitter } from "./Utils";
import UploadLoader from "../components/UploadLoader";
import React from "react";

export default class Document {
  /**
   *
   * @static
   * @param  {Document} file
   * @param {DocumentMeta} meta
   * @return {Firebase.storage.UploadTask}
   * @memberof Document
   */
  static upload(file, meta) {
    let uploadTask = Fire.firebase()
      .storage()
      .ref(`/${meta.uid}`)
      .put(file);
    return uploadTask;
  }
  static async getURL(meta) {
    return await Fire.firebase()
      .storage()
      .ref(`/${meta.uid}`)
      .getDownloadURL();
  }
}

class JobManager extends EventEmitter {
  /**
   * @private
   * @memberof JobManager
   */
  _uploadJobs = {};

  get allJobs() {
    return Object.values(this._uploadJobs);
  }

  getJob(jobID) {
    return this._uploadJobs[jobID];
  }

  setJob(job) {
    this.emit("job_changed", { job });
    this._uploadJobs[job.uid] = job;
  }

  updateJob(jobID, job) {
    this.emit("job_changed", { job });
    this._uploadJobs[jobID] = Object.assign(this._uploadJobs[jobID] || {}, job);
  }
}

export class UploadJob {
  static Jobs = new JobManager();

  /**
   * @type {"preparing" | "uploading" | "done" | "error" | "canceled", "unknown"}
   * @memberof UploadJob
   */
  status = "preparing";
  totalBytes = 0;
  bytesTransferred = 0;
  get percent() {
    return (
      (this.totalBytes ? this.bytesTransferred / this.totalBytes : 1) * 100
    );
  }
  /**
   * @type {String}
   * @memberof UploadJob
   */
  name;
  uid = IDGen.generateUID();
  /**
   * @type {String}
   * @memberof UploadJob
   */
  project;
  /**
   * Creates an instance of UploadJob.
   * @param  {UploadJob} args
   * @memberof UploadJob
   */
  constructor(args) {
    Object.assign(this, args);
  }
}

export class DocumentArchive {
  uid = IDGen.generateUID();
  name;
  type;
  files = [];
  constructor(args) {
    Object.assign(this, args);
  }
}

export class DocumentMeta {
  uid = "" + Date.now() + ":" + IDGen.generateUID();
  name;
  type;
  size;
  dateModifed;
  dateUploaded = Date.now();
  uploader;
  hash;
  /**
   * @type {"unavailable" | "available" | "unknown"}
   * @memberof DocumentMeta
   */
  state;
  /**
   * Creates an instance of DocumentMeta.
   * @param  {DocumentMeta} args
   * @memberof DocumentMeta
   */
  constructor(args) {
    Object.assign(this, args);
  }
}

class DocumentType {}
