import admin from "firebase-admin";

// Check if Firebase Admin has already been initialized
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY ?? "");

  // Initialize Firebase Admin only once
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const cloudFirestore = admin.firestore();
