const User = require('../models/User');
const { createClerkClient } = require('@clerk/clerk-sdk-node');

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    console.log('=== ADMIN AUTH MIDDLEWARE ===');
    console.log('Checking if user is admin...');
    
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
    
    // If user doesn't exist, create them automatically
    if (!user) {
      console.log('User not found in database, fetching from Clerk...');
      
      try {
        // Get user information from Clerk
        const clerkUser = await clerkClient.users.getUser(clerkUserId);
        console.log('Clerk user info retrieved:', JSON.stringify(clerkUser, null, 2));
        
        if (clerkUser) {
          // Get primary email
          let email = '';
          if (clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0) {
            const primaryEmail = clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId);
            email = primaryEmail ? primaryEmail.emailAddress : clerkUser.emailAddresses[0].emailAddress;
          }
          
          // Get names
          const firstName = clerkUser.firstName || 'Unknown';
          const lastName = clerkUser.lastName || 'User';
          
          // Create user in database
          const userData = {
            clerkId: clerkUserId,
            email: email,
            firstName: firstName,
            lastName: lastName,
          };
          
          console.log('Creating user with data:', userData);
          user = new User(userData);
          await user.save();
          console.log('New user created:', user);
        }
      } catch (clerkError) {
        console.error('Error fetching user from Clerk API:', clerkError);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    
    if (!user) {
      console.log('User could not be created or found');
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
};

module.exports = requireAdmin;