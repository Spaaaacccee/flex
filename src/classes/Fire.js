import Firebase from "firebase";

export default class Fire {
  /**
   * Gets the singleton Firebase instance
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

  /**
   * Serialises an object for storage in firestore.
   * Serialising converts any arrays to a collection.
   * Currently not in use.
   * @static
   * @param  {Object} object
   * @return {SerialisedObject}
   * @memberof Fire
   */
  static serialise(object) {
    return new SerialisedObject(object);
  }
  static deserialise(serialisedObject) {
    return new SerialisedObject().deserialise.bind(serialisedObject);
  }
}

class SerialisedObject {
  /**
   * Creates an instance of SerialisedObject.
   * @param  {Object} object
   * @memberof SerialisedObject
   */
  constructor(object) {
    if (object instanceof Object) {
        
    }
  }

  /**
   * Deserialises a serialised object into an object of a type.
   * The type's constructor must not require any arguments
   * @param  {Function} type
   * @return {Object}
   * @memberof SerialisedObject
   */
  deserialise(type) {

  }
}
