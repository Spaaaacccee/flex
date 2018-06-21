import Firebase from "firebase";

export default class Fire {
  /**
   * Gets a singleton Firebase instance
   * @return {Firebase} 
   * @memberof Fire
   */
  static firebase() {
    if (Firebase.apps.length === 0) {
      var config = {
        apiKey: "AIzaSyDky75Lh8P3sqMCB3MvUVnRjwfquOcMerE",
        authDomain: "flex-space.firebaseapp.com",
        databaseURL: "https://flex-space.firebaseio.com",
        projectId: "flex-space",
        storageBucket: "",
        messagingSenderId: "79879287257"
      };
      Firebase.initializeApp(config);
    }
    return Firebase;
  }
}
