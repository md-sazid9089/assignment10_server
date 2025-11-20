const admin = require('firebase-admin');
const path = require('path');

/**
 * Initialize Firebase Admin SDK
 * Supports two methods:
 * 1. Environment variables (recommended for production)
 * 2. Service account JSON file (for development)
 */
const initializeFirebaseAdmin = () => {
  try {
    // Check if already initialized
    if (admin.apps.length > 0) {
      console.log('Firebase Admin already initialized');
      return admin.app();
    }

    // Method 1: Try environment variables first (for production)
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
    }

    // Method 2: Try service account file (for development)
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

    // No configuration found
    console.warn('⚠️ Firebase Admin configuration not found!');
    console.warn('Please set up Firebase credentials in .env file');
    console.warn('See FIREBASE_SETUP.md for instructions');
    
    return null;

  } catch (error) {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Service account file not found. Check FIREBASE_SERVICE_ACCOUNT_PATH in .env');
    }
    
    return null;
  }
};

// Initialize Firebase Admin
const firebaseApp = initializeFirebaseAdmin();

// Export admin instance and auth
module.exports = {
  admin,
  auth: firebaseApp ? admin.auth() : null,
  isInitialized: () => admin.apps.length > 0
};
