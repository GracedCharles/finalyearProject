const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// Add logging middleware
const authMiddleware = (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Incoming request to:', req.url);
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  console.log('Authorization header:', req.headers.authorization);
  
  // If there's an authorization header, try to parse it
  if (req.headers.authorization) {
    const token = req.headers.authorization.replace('Bearer ', '');
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
  }
  
  console.log('========================');
  next();
};

// Create the Clerk authentication middleware
const clerkAuth = ClerkExpressRequireAuth({
  onError: (err, req, res, next) => {
    console.error('Clerk authentication error:', err);
    // Continue to next middleware even if auth fails for debugging
    next();
  },
  authorizedParties: [
    'http://localhost:5000',
    'http://10.0.2.2:5000',
    'http://192.168.43.72:5000', // Add your computer's IP
    'http://localhost:8081',
    'http://10.0.2.2:8081',
    'http://192.168.43.72:8081', // Add your computer's IP for Expo
    'http://localhost:5001',
    'http://10.0.2.2:5001',
    'http://192.168.43.72:5001'  // Add your computer's IP for other ports
  ],
  strict: false // Allow requests without authentication for debugging
});

module.exports = (req, res, next) => {
  // Run logging middleware first
  authMiddleware(req, res, () => {
    // Then run Clerk authentication middleware
    clerkAuth(req, res, next);
  });
};