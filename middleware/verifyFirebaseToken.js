/**
 * Demo-mode authentication middleware
 * This file no longer depends on Firebase Admin. It provides lightweight
 * middleware helpers that read `userEmail`/`userName` from the request
 * (body/query/params) so the rest of the app can rely on `req.user` when
 * available but continue to function in demo-mode without Admin SDK.
 */

/**
 * Strict verify middleware in demo-mode: will attach `req.user` when
 * `userEmail` is provided in the request body/query/params. Otherwise
 * it sets `req.user = null` and allows the request to continue.
 */
const verifyFirebaseToken = async (req, res, next) => {
  // Demo-mode: derive user from request payload rather than verifying tokens
  const bodyEmail = req.body?.userEmail || req.query?.userEmail || req.params?.userEmail || null;
  const bodyName = req.body?.userName || req.query?.userName || null;

  if (bodyEmail) {
    req.user = {
      email: String(bodyEmail).toLowerCase(),
      name: bodyName || null
    };
  } else {
    req.user = null;
  }

  // Continue (demo-mode does not block when token service unavailable)
  return next();
};

/**
 * Optional middleware - verifies token if present, but allows request if not
 * Useful for routes that can be accessed by both authenticated and unauthenticated users
 */
const optionalAuth = async (req, res, next) => {
  const bodyEmail = req.body?.userEmail || req.query?.userEmail || req.params?.userEmail || null;
  const bodyName = req.body?.userName || req.query?.userName || null;
  if (bodyEmail) {
    req.user = { email: String(bodyEmail).toLowerCase(), name: bodyName || null };
  } else {
    req.user = null;
  }
  next();
};

/**
 * Middleware to check if the authenticated user owns the resource
 * Use after verifyFirebaseToken middleware
 * 
 * @param {string} emailField - Field name containing the owner's email (default: 'userEmail')
 */
const checkOwnership = (emailField = 'userEmail') => {
  return (req, res, next) => {
    // In demo-mode we rely on the client-provided email for ownership checks
    const ownerEmail = req.body?.[emailField] || req.params?.[emailField] || req.query?.[emailField];
    if (!ownerEmail) {
      return res.status(400).json({ success: false, message: `${emailField} is required` });
    }

    const providedEmail = req.body?.userEmail || req.query?.userEmail || req.params?.userEmail || null;
    if (providedEmail && String(providedEmail).toLowerCase() !== String(ownerEmail).toLowerCase()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to perform this action', error: 'Resource ownership verification failed' });
    }

    // If no providedEmail, we allow the request (demo mode won't strictly enforce ownership)
    return next();
  };
};

module.exports = { verifyFirebaseToken, optionalAuth, checkOwnership };
