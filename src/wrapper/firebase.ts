import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { config } from "dotenv";
config();

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_CERT_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CERT_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_CERT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  databaseAuthVariableOverride: {
    uid: process.env.FIREBASE_UID,
  },
});

const db = getFirestore();

export default db;
