const User = require('../models/User');
const requireAuth = require('./auth');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  console.log('=== ADMIN AUTH MIDDLEWARE ===');
  console.log('Checking if user is admin...');
  
  // First run the standard auth middleware to populate req.auth
  requireAuth(req, res, async (err) => {
    if (err) {
      console.log('Authentication failed:', err);
      return res.status(401).json({ error: 'Unauthenticated' });
    }
    
    try {
      // Check if user is authenticated
      if (!req.auth || !req.auth.userId) {
        console.log('User not authenticated - No auth object or userId');
        return res.status(401).json({ error: 'Unauthenticated' });
      }
      
      const clerkUserId = req.auth.userId;
      console.log('Authenticated user ID:', clerkUserId);
      console.log('Full auth object:', JSON.stringify(req.auth, null, 2));
      
      // Try to find the user in the database
      let user = await User.findOne({ clerkId: clerkUserId });
      console.log('User found in database:', user);
      
      // If user doesn't exist, that's an issue for admin functions
      if (!user) {
        console.log('User not found in database for admin function');
        return res.status(401).json({ error: 'User not found' });
      }
      
      console.log('User found in database:', user.email, 'Role:', user.role);
      
      // Check if user has admin role
      if (user.role !== 'admin') {
        console.log('User is not admin. User role:', user.role);
        return res.status(403).json({ 
          error: 'Forbidden: Admin access required',
          userRole: user.role,
          requiredRole: 'admin'
        });
      }
      
      console.log('User is admin, allowing access');
      // Attach user to request for use in controllers
      req.user = user;
      next();
    } catch (error) {
      console.error('Admin auth error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

module.exports = requireAdmin;