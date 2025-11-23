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
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      console.log('✅ Firebase Admin initialized successfully (env vars)');
      return admin.app();
    }
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '..', 'serviceAccountKey.json');
    try {
      const serviceAccount = require(serviceAccountPath);
      console.log('🔥 Initializing Firebase Admin with service account file...');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized successfully (service account)');
      return admin.app();
    } catch (fileError) {
      console.error('⚠️ Service account file error:', fileError.message);
      console.error('Looking at path:', serviceAccountPath);
    }
    return null;
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
