const admin = require('firebase-admin');
const path = require('path');

const initializeFirebaseAdmin = () => {
  try {
    if (admin.apps.length > 0) {
      console.log('Firebase Admin already initialized');
      return admin.app();
    }
    if (process.env.FIREBASE_PROJECT_ID && 
        process.env.FIREBASE_PRIVATE_KEY && 
        process.env.FIREBASE_CLIENT_EMAIL) {
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
    } else {
      console.error('❌ Missing Firebase environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
      return null;
    }
  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Service account file not found. Check FIREBASE_SERVICE_ACCOUNT_PATH in .env');
    }
    return null;
  }
};

const firebaseApp = initializeFirebaseAdmin();

module.exports = {
  admin,
  auth: firebaseApp ? admin.auth() : null,
  isInitialized: () => admin.apps.length > 0
};
