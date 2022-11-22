import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBCWtpIkw5aNr9Zhk-0MfBaoN3CVB2qUbk",
  authDomain: "womanuptest.firebaseapp.com",
  databaseURL: "https://womanuptest-default-rtdb.firebaseio.com",
  projectId: "womanuptest",
  storageBucket: "womanuptest.appspot.com",
  messagingSenderId: "28883394160",
  appId: "1:28883394160:web:5d387f422a042d77861eb5",
  measurementId: "G-YF3G2H5GH6",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
