import Firebase from "firebase";

export default class Fire {
  /**
   * Gets the singleton Firebase instance
   * @return {Firebase}
   * @memberof Fire
   */
  static firebase() {
    // If there's no initialised firebase app, initilise one right now.
    if (Firebase.apps.length === 0) {
      var config = {
        apiKey: "AIzaSyDky75Lh8P3sqMCB3MvUVnRjwfquOcMerE",
        authDomain: "flex-space.firebaseapp.com",
        databaseURL: "https://flex-space.firebaseio.com",
        projectId: "flex-space",
        storageBucket: "flex-space.appspot.com",
        messagingSenderId: "79879287257"
      };
      Firebase.initializeApp(config);
    }
    // Return the current firebase instance.
    return Firebase;
  }
}
