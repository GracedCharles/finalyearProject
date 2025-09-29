const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { createClerkClient } = require('@clerk/clerk-sdk-node');

// Initialize Clerk client
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    console.log('=== GET CURRENT USER ===');
    console.log('Full req object keys:', Object.keys(req));
    console.log('Full req object auth property:', req.auth);
    
    // Check if req.auth exists
    if (!req.auth) {
      console.log('No auth object found in request');
      return res.status(401).json({ error: 'Unauthorized - No auth object' });
    }
    
    const clerkUser = req.auth;
    console.log('Clerk user from auth:', clerkUser);
    
    if (!clerkUser || !clerkUser.userId) {
      console.log('No authenticated user found');
      return res.status(401).json({ error: 'Unauthorized - No user ID' });
    }
    
    // Try to find the user in the database
    let user = await User.findOne({ clerkId: clerkUser.userId });
    
    // If user doesn't exist, create them automatically
    if (!user) {
      console.log('User not found, creating new user...');
      
      // Try to get detailed user information from Clerk API
      let email = '';
      let firstName = '';
      let lastName = '';
      
      try {
        console.log('Fetching user details from Clerk API...');
        const clerkUserInfo = await clerkClient.users.getUser(clerkUser.userId);
        console.log('Clerk user info:', clerkUserInfo);
        
        if (clerkUserInfo) {
          // Get primary email
          if (clerkUserInfo.emailAddresses && clerkUserInfo.emailAddresses.length > 0) {
            const primaryEmail = clerkUserInfo.emailAddresses.find(email => email.id === clerkUserInfo.primaryEmailAddressId);
            email = primaryEmail ? primaryEmail.emailAddress : clerkUserInfo.emailAddresses[0].emailAddress;
          }
          
          // Get names
          firstName = clerkUserInfo.firstName || '';
          lastName = clerkUserInfo.lastName || '';
        }
      } catch (clerkError) {
        console.log('Error fetching user from Clerk API:', clerkError);
      }
      
      // If we still don't have email from Clerk API, check the auth object
      if (!email) {
        // Check if email is in the claims
        if (clerkUser.claims && clerkUser.claims.email) {
          email = clerkUser.claims.email;
        }
      }
      
      // If we still don't have email, we have a problem
      if (!email) {
        console.log('Warning: No email found for user');
        // In a real application, you might want to handle this differently
        // For now, we'll use a placeholder but log the issue
        email = `${clerkUser.userId}@placeholder.clerk`;
      }
      
      const userData = {
        clerkId: clerkUser.userId,
        email: email,
        firstName: firstName || 'Unknown',
        lastName: lastName || 'User',
      };
      
      console.log('Creating user with data:', userData);
      
      user = new User(userData);
      await user.save();
      console.log('New user created:', user);
    }
    
    console.log('User found/created:', user);
    // Return the full user object with all fields
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    console.log('=== CREATE USER ===');
    
    // For user creation, we need to manually extract user info from the token
    // since this endpoint doesn't require authentication middleware
    const authHeader = req.headers.authorization;
    console.log('Authorization header:', authHeader);
    
    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
    
    // Try to manually decode the token
    try {
      const decoded = jwt.decode(token);
      console.log('Manually decoded token:', decoded);
      
      if (!decoded || !decoded.sub) {
        console.log('Invalid token - no user ID found');
        return res.status(401).json({ error: 'Unauthorized - Invalid token' });
      }
      
      const clerkUserId = decoded.sub;
      
      // Extract available information from the decoded token
      let email = '';
      let firstName = '';
      let lastName = '';
      
      // Check if email is in the decoded token
      if (decoded.email) {
        email = decoded.email;
      }
      
      // Check if names are in the decoded token
      if (decoded.firstName) {
        firstName = decoded.firstName;
      }
      
      if (decoded.lastName) {
        lastName = decoded.lastName;
      }
      
      // If we still don't have email, we have a problem
      if (!email) {
        console.log('Warning: No email found in decoded token');
        // In a real application, you might want to handle this differently
        // For now, we'll use a placeholder but log the issue
        email = `${clerkUserId}@placeholder.clerk`;
      }
      
      const userData = {
        clerkId: clerkUserId,
        email: email,
        firstName: firstName || 'Unknown',
        lastName: lastName || 'User',
      };
      
      console.log('Creating user with data:', userData);
      
      const existingUser = await User.findOne({ clerkId: clerkUserId });
      if (existingUser) {
        console.log('User already exists:', existingUser);
        return res.status(400).json({ error: 'User already exists' });
      }
      
      const newUser = new User(userData);
      await newUser.save();
      console.log('New user created:', newUser);
      res.status(201).json(newUser);
    } catch (decodeError) {
      console.error('Error decoding token:', decodeError);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Setup user profile (called after account setup)
const setupUserProfile = async (req, res) => {
  try {
    console.log('=== SETUP USER PROFILE ===');
    console.log('Received request to setup user profile');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    
    let clerkUser;
    
    // Check if req.auth exists (from middleware)
    if (req.auth) {
      clerkUser = req.auth;
    } else {
      // Try to manually decode the token
      const authHeader = req.headers.authorization;
      console.log('Authorization header:', authHeader);
      
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
        
        // Try to manually decode the token
        try {
          const decoded = jwt.decode(token);
          console.log('Manually decoded token:', decoded);
          
          if (decoded && decoded.sub) {
            clerkUser = {
              userId: decoded.sub,
              email: decoded.email,
              firstName: decoded.firstName,
              lastName: decoded.lastName
            };
          }
        } catch (decodeError) {
          console.error('Error manually decoding token:', decodeError);
        }
      }
    }
    
    if (!clerkUser || !clerkUser.userId) {
      console.log('No authenticated user found');
      return res.status(401).json({ error: 'Unauthorized - No user ID' });
    }
    
    // Validate required fields
    const { firstName, lastName, address, phoneNumber, driverLicenseNumber, officerRegistrationNumber } = req.body;
    
    if (!firstName || !lastName) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    console.log('Setting up user profile:', { clerkUser, firstName, lastName, address, phoneNumber, driverLicenseNumber, officerRegistrationNumber });
    
    // Find and update the user (create if doesn't exist)
    const user = await User.findOneAndUpdate(
      { clerkId: clerkUser.userId },
      { 
        firstName,
        lastName,
        address: address || '',
        phoneNumber: phoneNumber || '',
        driverLicenseNumber: driverLicenseNumber || '', // Update driver license if provided
        officerRegistrationNumber: officerRegistrationNumber || '' // Update officer registration number if provided
      },
      { new: true, upsert: true, runValidators: true } // Create if doesn't exist, return updated doc
    );
    
    console.log('User profile setup completed:', user);
    res.json(user);
  } catch (error) {
    console.error('Error setting up user profile:', error);
    // Send more detailed error information
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

// Update user driver license (for admin use)
const updateUserDriverLicense = async (req, res) => {
  try {
    const { userId, driverLicenseNumber } = req.body;
    
    if (!userId || !driverLicenseNumber) {
      return res.status(400).json({ error: 'User ID and driver license number are required' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { driverLicenseNumber },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Driver license updated successfully', user });
  } catch (error) {
    console.error('Error updating user driver license:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error', 
        details: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users (for admin use)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-__v').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCurrentUser,
  createUser,
  setupUserProfile,
  updateUserDriverLicense,
  getAllUsers
};