import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, query, orderByChild, startAt } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBeHQCXo9YLx-FzL3spkv3sgC-aK_QRFJM",
  authDomain: "timetrack-e4d68.firebaseapp.com",
  projectId: "timetrack-e4d68",
  storageBucket: "timetrack-e4d68.firebasestorage.app",
  messagingSenderId: "117358787306",
  appId: "1:117358787306:web:ad15068d47e9dff0e47593",
  measurementId: "G-GNNH9BNV48",
  databaseURL: "https://timetrack-e4d68-default-rtdb.asia-southeast1.firebasedatabase.app/",
};
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

