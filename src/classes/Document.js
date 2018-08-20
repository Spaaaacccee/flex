import Fire from "./Fire";
import { message, notification } from "antd";
import $, { EventEmitter } from "./Utils";
import UploadLoader from "../components/UploadLoader";
import React from "react";
import DocumentType from "./DocumentType";

/**
 * Class for representing a file, or document, in the database
 * @export
 * @class Document
 */
export default class Document {
  /**
   * Gets the icon name based on the file extension.
   * @static
   * @param  {String} filename
   * @return
   * @memberof Document
   */
  static getFiletypeIcon(filename) {
    // Get the file extension by the
    return DocumentType.getIconName(
      filename
        .split(".")
        .pop()
        .toLowerCase()
    );
  }

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
    try {
      return await Fire.firebase()
        .storage()
        .ref(`/${meta.uid}/${meta.name}`)
        .getDownloadURL();
    } catch (e) {
      message.error(`We couldn't get ${meta.name} because its source file has been removed.`);
      return null;
    }
  }
  static async tryPreviewWindow(meta) {
    let url;
    let msg = message.loading("Getting the download link for your file");
    if (meta.uploadType) {
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

  /**
   *
   * @static
   * @param  {DocumentMeta} meta
   * @return {Promise<number>}
   * @memberof Document
   */
  static async delete(meta) {
    try {
      await Fire.firebase()
        .storage()
        .ref(`/${meta.uid}/${meta.name}`)
        .delete();
      return 0;
    } catch (e) {
      return 1;
    }
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
  uid = $.id().generateUID();
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
  uid = "" + Date.now() + ":" + $.id().generateUID();
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

class JobManager extends EventEmitter {
  /**
   * @private
   * @memberof JobManager
   */
  _uploadJobs = {};

  get allJobs() {
    return $.object(this._uploadJobs).values();
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
  uid = $.id().generateUID();
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
