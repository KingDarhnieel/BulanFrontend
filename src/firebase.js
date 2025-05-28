// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBSjwCSKMPMG3LSWIkqdaYCncOwfJlzZzo",
  authDomain: "keke-dbbb4.firebaseapp.com",
  projectId: "keke-dbbb4",
  storageBucket: "keke-dbbb4.appspot.com",
  messagingSenderId: "287672612429",
  appId: "1:287672612429:web:3bd26efc24ce543193ce04",
  measurementId: "G-D8ETPX7RH8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
