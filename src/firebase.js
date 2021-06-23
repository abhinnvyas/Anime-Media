import firebase from "firebase";

const firebaseApp = firebase.initializeApp({
  apiKey: "AIzaSyD5brvTESQoxtzH5Cfk39AYVcyRBK1fS2g",
  authDomain: "instagram-clone-99de8.firebaseapp.com",
  projectId: "instagram-clone-99de8",
  storageBucket: "instagram-clone-99de8.appspot.com",
  messagingSenderId: "868007585776",
  appId: "1:868007585776:web:a681080e7a5716d11a9f35",
  measurementId: "G-LVXHQNJF9V"
});
  

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();
const storage = firebaseApp.storage();

export { db, auth, storage };
