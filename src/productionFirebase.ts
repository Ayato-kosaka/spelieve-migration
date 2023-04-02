import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config({
  path: "./spelieve-secret/spelieve-backend/production/.env",
  override: true,
});
const productionAdmin = admin.initializeApp(
  {
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  },
  admin.apps.length > 0 ? "production" : undefined
);

export const productionDB = productionAdmin.firestore();
export const productionStorage = productionAdmin.storage();
