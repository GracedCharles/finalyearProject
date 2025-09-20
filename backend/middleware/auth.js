const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const requireAuth = ClerkExpressRequireAuth({
  onError: (err, req, res, next) => {
    console.error('Clerk authentication error:', err);
    // Continue to next middleware even if auth fails for debugging
    next();
  },
  authorizedParties: [
    'http://localhost:5000',
    'http://10.0.2.2:5000',
    'http://localhost:8081',
    'http://10.0.2.2:8081',
    'http://localhost:5001',
    'http://10.0.2.2:5001'
  ],
  strict: false // Allow requests without authentication for debugging
});

// Add logging middleware
const authMiddleware = (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Incoming request to:', req.url);
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  console.log('Authorization header:', req.headers.authorization);
  console.log('========================');
  next();
};

module.exports = (req, res, next) => {
  authMiddleware(req, res, next);
  return requireAuth(req, res, next);
};