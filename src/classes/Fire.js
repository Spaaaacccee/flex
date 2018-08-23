import Firebase from "firebase/app"
import "firebase/auth";
import "firebase/database"
import "firebase/storage"

/**
 * Class for managing Firebase
 * @export
 * @class Fire
 */
export default class Fire {
  // Configuration information to connect to Firebase.
  static config = {
    apiKey: "AIzaSyDky75Lh8P3sqMCB3MvUVnRjwfquOcMerE",
    clientId:
      "79879287257-rhkuuivs2g1rm3gc8r64rfq0ibumgo06.apps.googleusercontent.com",
    scopes: ["https://www.googleapis.com/auth/drive"],
    discoveryDocs: [
      "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"
    ],
    authDomain: "flex-space.firebaseapp.com",
    databaseURL: "https://flex-space.firebaseio.com",
    projectId: "flex-space",
    storageBucket: "flex-space.appspot.com",
    messagingSenderId: "79879287257"
  };

  /**
   * Gets the singleton Firebase instance
   * @return {Firebase}
   * @memberof Fire
   */
  static firebase() {
    // If there's no initialised firebase app, initilise one right now.
    if (Firebase.apps.length === 0) {
      Firebase.initializeApp(Fire.config);
    }
    // Return the current firebase instance.
    return Firebase;
  }

  /**
   * Authenticate Google APIs. This is necessary for Google Drive integration to work
   * @static
   * @param  {()=>{})} callback 
   * @return {void}@memberof Fire
   */
  static authenticateGoogleAPIs(callback) {
    // Google API script to be injected.
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://apis.google.com/js/api.js";
    // Once the Google API Client is loaded, initialise it.
    script.onload = e => {
      window.gapi.load("client", () => {
        // Initialise the Google API Client with the config object
        window.gapi.client
          .init({
            apiKey: Fire.config.apiKey,
            clientId: Fire.config.clientId,
            discoveryDocs: Fire.config.discoveryDocs,
            scope: Fire.config.scopes.join(" ")
          })
          // Loading is finished, notify the caller.
          .then(() => {
            callback();
          });
      });
    };
    // Inject the script into the document
    document.getElementsByTagName("head")[0].appendChild(script);
  }
}
