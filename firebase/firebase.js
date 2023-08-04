import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getStorage } from 'firebase/storage'
import { getFirestore } from 'firebase/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyAubnxJzKvlU-or_hW0Lp1zg6abuCoTE2I",
  authDomain: "fir-chat-app-458a4.firebaseapp.com",
  projectId: "fir-chat-app-458a4",
  storageBucket: "fir-chat-app-458a4.appspot.com",
  messagingSenderId: "651897101252",
  appId: "1:651897101252:web:473af17182d5679781e291"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const storage = getStorage(app)
export const db = getFirestore(app)