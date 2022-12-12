import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const { REACT_APP_apiKey, REACT_APP_messagingSenderId, REACT_APP_appId, REACT_APP_measurementId } =
  process.env;

const firebaseConfig = {
  apiKey: REACT_APP_apiKey,
  authDomain: "womanuptest.firebaseapp.com",
  databaseURL: "https://womanuptest-default-rtdb.firebaseio.com",
  projectId: "womanuptest",
  storageBucket: "womanuptest.appspot.com",
  messagingSenderId: REACT_APP_messagingSenderId,
  appId: REACT_APP_appId,
  measurementId: REACT_APP_measurementId,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
