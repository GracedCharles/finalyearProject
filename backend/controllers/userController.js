const User = require('../models/User');

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    console.log('=== GET CURRENT USER ===');
    const clerkUser = req.auth;
    console.log('Clerk user from auth:', clerkUser);
    
    if (!clerkUser || !clerkUser.userId) {
      console.log('No authenticated user found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const user = await User.findOne({ clerkId: clerkUser.userId });
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User found:', user);
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    console.log('=== CREATE USER ===');
    const clerkUser = req.auth;
    console.log('Clerk user from auth:', clerkUser);
    
    if (!clerkUser || !clerkUser.userId) {
      console.log('No authenticated user found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { email, firstName, lastName } = clerkUser;
    
    const existingUser = await User.findOne({ clerkId: clerkUser.userId });
    if (existingUser) {
      console.log('User already exists:', existingUser);
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const newUser = new User({
      clerkId: clerkUser.userId,
      email,
      firstName,
      lastName,
    });
    
    await newUser.save();
    console.log('New user created:', newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
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
    
    const clerkUser = req.auth;
    console.log('Clerk user from auth:', clerkUser);
    
    // Check if user is authenticated
    if (!clerkUser || !clerkUser.userId) {
      console.log('No authenticated user found');
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Validate required fields
    const { firstName, lastName, address, phoneNumber } = req.body;
    
    if (!firstName || !lastName) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    
    console.log('Setting up user profile:', { clerkUser, firstName, lastName, address, phoneNumber });
    
    // Find and update the user
    const user = await User.findOneAndUpdate(
      { clerkId: clerkUser.userId },
      { 
        firstName,
        lastName,
        address: address || '',
        phoneNumber: phoneNumber || ''
      },
      { new: true, upsert: true, runValidators: true } // Create if doesn't exist, return updated doc
    );
    
    console.log('User profile setup completed:', user);
    res.json(user);
  } catch (error) {
    console.error('Error setting up user profile:', error);
    // Send more detailed error information
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', details: error.message });
    }
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};

module.exports = {
  getCurrentUser,
  createUser,
  setupUserProfile,
};