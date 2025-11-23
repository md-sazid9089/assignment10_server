const admin = require('firebase-admin');
const path = require('path');

const initializeFirebaseAdmin = () => {
  try {
    if (admin.apps.length > 0) {
      console.log('Firebase Admin already initialized');
      return admin.app();
    }
    const missing = [];
    if (!process.env.FIREBASE_PROJECT_ID) missing.push('FIREBASE_PROJECT_ID');
    if (!process.env.FIREBASE_PRIVATE_KEY) missing.push('FIREBASE_PRIVATE_KEY');
    if (!process.env.FIREBASE_CLIENT_EMAIL) missing.push('FIREBASE_CLIENT_EMAIL');
    if (missing.length) {
      console.error('❌ Missing Firebase environment variables:', missing.join(', '));
      return null;
    }
    console.log('🔥 Initializing Firebase Admin with environment variables...');
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('✅ Firebase Admin initialized successfully (env vars)');
    return admin.app();
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    return null;
  }
};

const firebaseApp = initializeFirebaseAdmin();

module.exports = {
  admin,
  auth: firebaseApp ? admin.auth() : null,
  isInitialized: () => admin.apps.length > 0
};
