import firebase_admin from "firebase-admin";
import { getDatabase } from "firebase-admin/database";
import { config } from "dotenv";
config();

if (!firebase_admin.apps.length) {
  firebase_admin.initializeApp({
    credential: firebase_admin.credential.cert(
      JSON.parse(process.env["firebase_cert"] as string)
    ),
    databaseURL: "https://two-k-two-r-name-bot-default-rtdb.firebaseio.com",
    databaseAuthVariableOverride: {
      uid: process.env.FIREBASE_UID,
    },
  });
}
const firebase = getDatabase().ref("/");

export default firebase;
