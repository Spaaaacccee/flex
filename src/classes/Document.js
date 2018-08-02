import Firebase from "firebase";
import Fire from "./Fire";
import { message, notification } from "antd";
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
      .ref(`/${meta.uid}/${meta.name}`)
      .put(file);
    return uploadTask;
  }
  static async getURL(meta) {
    return await Fire.firebase()
      .storage()
      .ref(`/${meta.uid}/${meta.name}`)
      .getDownloadURL();
  }
  static async tryPreviewWindow(meta) {
    let url;
    let msg = message.loading("Getting the download link for your file");
    if(meta.uploadType) {
      if (meta.uploadType === "cloud") {
        url = meta.source.url;
      } else {
        url = `${await Document.getURL(meta.files[0])}`;
      }
    } else {
      url = `${await Document.getURL(meta)}`;
    }
    window.open(url);
    msg();
  }
}

export class CloudDocument {
  /**
   * @type {"local" | "cloud"}
   * @memberof CloudDocument
   */
  uploadType = "cloud";
  source = {};
  constructor(file) {
    this.source = file;
  }
}

export class DocumentArchive {
  /**
   * @type {"local" | "cloud"}
   * @memberof DocumentArchive
   */
  uploadType = "local";
  uid = IDGen.generateUID();
  name;
  /**
   * MIME type
   * @type {String}
   * @memberof DocumentArchive
   */
  type;
  files = [];
  constructor(args) {
    Object.assign(this, args);
  }
}

export class DocumentMeta {
  uid = "" + Date.now() + ":" + IDGen.generateUID();
  description;
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

class JobManager extends EventEmitter {
  /**
   * @private
   * @memberof JobManager
   */
  _uploadJobs = {};

  get allJobs() {
    return ObjectUtils.values(this._uploadJobs);
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

  cancelJob = () => {};

  /**
   * Creates an instance of UploadJob.
   * @param  {UploadJob} args
   * @memberof UploadJob
   */
  constructor(args) {
    Object.assign(this, args);
  }
}
