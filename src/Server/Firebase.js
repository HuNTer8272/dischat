
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';


firebase.initializeApp({
  apiKey: "AIzaSyC3FueiIRC-5nosApElYfJpK89O_eicBYI",
  authDomain: "dischat-1012d.firebaseapp.com",
  projectId: "dischat-1012d",
  storageBucket: "dischat-1012d.appspot.com",
  messagingSenderId: "257058137323",
  appId: "1:257058137323:web:1733bbc63895ef591dcaae",
  measurementId: "G-1S8CF1F80F",
  storageBucket:'gs://dischat-1012d.appspot.com/',
  
})
const auth = firebase.auth();
const firestore = firebase.firestore();

export  {auth,firestore};