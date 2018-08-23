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
    // Get the file icon name by the extension.
    // Split the original file name by ".", then take the lower case of the last section (which is the file extension)
    return DocumentType.getIconName(
      filename
        .split(".")
        .pop()
        .toLowerCase()
    );
  }

  /**
   * Upload a file to file storage.
   * @static
   * @param  {Document} file
   * @param {DocumentMeta} meta
   * @return {Firebase.storage.UploadTask}
   * @memberof Document
   */
  static upload(file, meta) {
    // Create a folder with the uid of the folder, then upload the file
    let uploadTask = Fire.firebase()
      .storage()
      .ref(`/${meta.uid}/${meta.name}`)
      .put(file);
    // Return the task so that it can be monitored.
    return uploadTask;
  }
  /**
   * Get the download URL of a file.
   * @static
   * @param  {DocumentMeta} meta
   * @return
   * @memberof Document
   */
  static async getURL(meta) {
    try {
      // Try to get the file from the url as describe in the meta.
      return await Fire.firebase()
        .storage()
        .ref(`/${meta.uid}/${meta.name}`)
        .getDownloadURL();
    } catch (e) {
      // If the file is not found, firebase will return an error, so catch this and display a message instead.
      message.error(
        `We couldn't get ${meta.name} because its source file has been removed.`
      );
      return null;
    }
  }

  /**
   * Try to open a download/preview window for the file
   * @static
   * @param  {DocumentArchive | DocumentMeta} meta
   * @return {void}
   * @memberof Document
   */
  static async tryPreviewWindow(meta) {
    let url;
    // Show a message while the download link is getting generated.
    let msg = message.loading("Getting the download link for your file");
    if (meta.uploadType) {
      if (meta.uploadType === "cloud") {
        // If the file is a cloud file, then the download link is already in the meta.
        url = meta.source.url;
      } else {
        // If the file is an archive, get the download link for the last version of the file
        if (meta.files && meta.files.length) {
          url = `${await Document.getURL(meta.files[0])}`;
        }
      }
    } else {
      // Otherwise, the file is an individual file, get the download link for it.
      url = `${await Document.getURL(meta)}`;
    }
    if (url) {
      window.open(url);
    } else {
      message.error("We couldn't get the file you're looking for.");
    }
    // Close the loading message.
    msg();
  }

  /**
   * Delete a file.
   * @static
   * @param  {DocumentMeta} meta
   * @return {Promise<number>}
   * @memberof Document
   */
  static async delete(meta) {
    try {
      // Try to delete the file.
      await Fire.firebase()
        .storage()
        .ref(`/${meta.uid}/${meta.name}`)
        .delete();
      return 0;
    } catch (e) {
      // If the delete fails, instead of throwing an error, return 1 to signify that the download failed.
      return 1;
    }
  }
}

/**
 * Represents a file from Google Drive.
 * @export
 * @class CloudDocument
 */
export class CloudDocument {
  /**
   * @type {"local" | "cloud"}
   * @memberof CloudDocument
   */
  uploadType = "cloud";
  /**
   * The source file, straight from the google drive API
   * @memberof CloudDocument
   */
  source = {};
  constructor(file) {
    this.source = file;
  }
}

/**
 * Represents a collection of file versions.
 * @export
 * @class DocumentArchive
 */
export class DocumentArchive {
  uid = $.id().generateUID();
  /**
   * @type {"local" | "cloud"}
   * @memberof DocumentArchive
   */
  uploadType = "local";
  name;
  /**
   * MIME type string
   * @type {String}
   * @memberof DocumentArchive
   */
  type;
  /**
   * All the files in this archive
   * @type {DocumentMeta}
   * @memberof DocumentArchive
   */
  files = [];

  constructor(args) {
    Object.assign(this, args);
  }
}

/**
 * Represents a single uploaded file
 * @export
 * @class DocumentMeta
 */
export class DocumentMeta {
  /**
   * A generated ID by combining the current date with a randomly generated ID for almost guaranteed uniqueness
   * @type {String}
   * @memberof DocumentMeta
   */
  uid = "" + Date.now() + ":" + $.id().generateUID();

  /**
   * A user-ented description of the file
   * @type {String}
   * @memberof DocumentMeta
   */
  description;

  /**
   * The file name, including extension.
   * @type {String}
   * @memberof DocumentMeta
   */
  name;

  /**
   * The MIME file type string.
   * @type {String}
   * @memberof DocumentMeta
   */
  type;

  /**
   * File size, in bytes.
   * @type {Number}
   * @memberof DocumentMeta
   */
  size;

  /**
   * The date the date is uploaded. By default, the time that this object is constructed is used, but can be overriden.
   * @type {Number}
   * @memberof DocumentMeta
   */
  dateUploaded = Date.now();
  /**
   * The ID of the user who uploaded this file
   * @type {String}
   * @memberof DocumentMeta
   */
  uploader;

  /**
   * An MD5 hash string for this file, to determine uniqueness.
   * @type {String}
   * @memberof DocumentMeta
   */
  hash;
  /**
   * The current status of the file. Usually, this will be "available"
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

/**
 * Class to manage ongoing upload jobs.
 * @class JobManager
 * @extends EventEmitter
 */
class JobManager extends EventEmitter {
  /**
   * All created upload jobs.
   * @private
   * @memberof JobManager
   */
  _uploadJobs = {};

  /**
   * Gets all ongoing jobs.
   * @readonly
   * @memberof JobManager
   */
  get allJobs() {
    // The internal _uploadJobs is an object, so convert it to an array of its values.
    return $.object(this._uploadJobs).values();
  }

  /**
   * Gets a specific job.
   * @param  {String} jobID
   * @return
   * @memberof JobManager
   */
  getJob(jobID) {
    return this._uploadJobs[jobID];
  }

  /**
   * Create a new job. The new job overwrites any old job that has the same id if it exists.
   * @param  {UploadJob} job
   * @return {void}
   * @memberof JobManager
   */
  setJob(job) {
    // Notify all listeners that a job has changed
    this.emit("job_changed", { job });
    // Set the new job.
    this._uploadJobs[job.uid] = job;
  }

  updateJob(jobID, job) {
    // Notify all listeners that a job has changed
    this.emit("job_changed", { job });
    // Update the new job with the old
    this._uploadJobs[jobID] = { ...(this._uploadJobs[jobID] || {}), ...job };
  }
}

/**
 * Represents a single uploading job
 * @export
 * @class UploadJob
 */
export class UploadJob {
  // Create a global job manager.
  static Jobs = new JobManager();
  
  uid = $.id().generateUID();

  /**
   * The status of the job.
   * @type {"preparing" | "uploading" | "done" | "error" | "canceled", "unknown"}
   * @memberof UploadJob
   */
  status = "preparing";
  /**
   * The total size of the file
   * @memberof UploadJob
   */
  totalBytes = 0;
  /**
   * The amount of the file that has been uploaded.
   * @memberof UploadJob
   */
  bytesTransferred = 0;
  /**
   * Get the percentage of the file that has been uploaded
   * @readonly
   * @memberof UploadJob
   */
  get percent() {
    // Calculate percent of file that has been uploaded. If the total bytes is 0 (which can happen when empty), return 100%
    return (
      (this.totalBytes ? this.bytesTransferred / this.totalBytes : 1) * 100
    );
  }
  /**
   * The name of the file that is uploading.
   * @type {String}
   * @memberof UploadJob
   */
  name;
  
  /**
   * The project that this job belongs to.
   * @type {String}
   * @memberof UploadJob
   */
  project;

  /**
   * An overrideable callback for when this job is canceled.
   * @memberof UploadJob
   */
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
