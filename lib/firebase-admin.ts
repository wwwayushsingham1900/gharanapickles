import * as admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    // Only initialize if we have the required env variables to prevent Next.js build failures
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Handle newlines in private key
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      console.warn("Firebase Admin missing environment variables. Skipping initialization.");
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

// In case admin is not initialized, fallback gracefully
const adminDb = admin.apps.length ? admin.firestore() : null as any;

export { adminDb };
