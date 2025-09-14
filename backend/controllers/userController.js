const User = require('../models/User');

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const clerkUser = req.auth;
    const user = await User.findOne({ clerkId: clerkUser.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create user
const createUser = async (req, res) => {
  try {
    const clerkUser = req.auth;
    const { email, firstName, lastName } = clerkUser;
    
    const existingUser = await User.findOne({ clerkId: clerkUser.userId });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const newUser = new User({
      clerkId: clerkUser.userId,
      email,
      firstName,
      lastName,
    });
    
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCurrentUser,
  createUser,
};