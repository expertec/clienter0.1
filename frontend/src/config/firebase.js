import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
     
    apiKey: "AIzaSyB1fRxF_U3KsjvX7X6AZosQ7DtNz8upttk",
    authDomain: "clienter-df7a5.firebaseapp.com",
    projectId: "clienter-df7a5",
    storageBucket: "clienter-df7a5.firebasestorage.app",
    messagingSenderId: "1054847151313",
    appId: "1:1054847151313:web:d38c23d3eba99deace69f0",
    measurementId: "G-HDRRWMQGWQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const firestore = getFirestore(app); 

export { auth, db, firestore };

   
   
   
   

