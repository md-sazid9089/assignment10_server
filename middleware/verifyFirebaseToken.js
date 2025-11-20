const { auth, isInitialized } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token
 * Protects routes that require authentication
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Check if Firebase is initialized
    if (!isInitialized()) {
      console.error('Firebase Admin not initialized');
      return res.status(500).json({
        success: false,
        message: 'Authentication service not available',
        error: 'Firebase Admin SDK is not configured'
      });
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No token provided. Please include Authorization: Bearer <token> header'
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Token is empty'
      });
    }

    // Verify token with Firebase Admin
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
      firebase: decodedToken // Full decoded token if needed
    };

    // Log successful authentication (optional, for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Authenticated user: ${req.user.email} (${req.user.uid})`);
    }

    // Continue to next middleware or route handler
    next();

  } catch (error) {
    console.error('Token verification error:', error.message);

    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        error: 'Your session has expired. Please sign in again',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format',
        error: 'The authentication token is malformed',
        code: 'INVALID_TOKEN'
      });
    }

    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        message: 'Token revoked',
        error: 'Your session has been revoked. Please sign in again',
        code: 'TOKEN_REVOKED'
      });
    }

    // Generic authentication error
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Invalid or expired token'
    });
  }
};

/**
 * Optional middleware - verifies token if present, but allows request if not
 * Useful for routes that can be accessed by both authenticated and unauthenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      req.user = null;
      return next();
    }

    // Try to verify token
    const decodedToken = await auth.verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
      firebase: decodedToken
    };

    next();

  } catch (error) {
    // Token is invalid, but we allow the request anyway
    req.user = null;
    next();
  }
};

/**
 * Middleware to check if the authenticated user owns the resource
 * Use after verifyFirebaseToken middleware
 * 
 * @param {string} emailField - Field name containing the owner's email (default: 'userEmail')
 */
const checkOwnership = (emailField = 'userEmail') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const ownerEmail = req.body[emailField] || req.params[emailField] || req.query[emailField];

    if (!ownerEmail) {
      return res.status(400).json({
        success: false,
        message: `${emailField} is required`
      });
    }

    if (req.user.email !== ownerEmail) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to perform this action',
        error: 'Resource ownership verification failed'
      });
    }

    next();
  };
};

module.exports = {
  verifyFirebaseToken,
  optionalAuth,
  checkOwnership
};
