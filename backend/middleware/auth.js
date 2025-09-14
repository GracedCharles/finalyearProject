const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

const requireAuth = ClerkExpressRequireAuth({
  onError: (err) => {
    console.error('Clerk authentication error:', err);
  },
});

module.exports = requireAuth;