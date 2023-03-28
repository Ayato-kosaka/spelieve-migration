import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config({ path: "./spelieve-secret/spelieve-backend/development/.env" });
admin.initializeApp(
  {
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  },
  admin.apps.length > 0 ? "development" : undefined
);

export const developmentDB = admin.firestore();
