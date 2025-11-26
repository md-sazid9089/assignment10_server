// Demo-mode: do not initialize Firebase Admin in this deployment.
// This module intentionally provides safe no-op stubs so code that
// requires it won't crash if the Admin SDK is not present.

module.exports = {
  admin: null,
  auth: null,
  isInitialized: () => false
};
