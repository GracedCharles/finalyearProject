/**
 * Script to add test driver license numbers to existing users
 * This is for testing purposes only - not for production use
 */

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use the same connection string as the main app
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/traffic_fine_system');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// Generate a test driver license number
const generateTestDriverLicenseNumber = (index) => {
  // Format: TEST-DL + padded index number
  return `TEST-DL${index.toString().padStart(4, '0')}`;
};

// Add test driver license numbers to all existing users
const addTestDriverLicenses = async () => {
  try {
    // Find all users
    const users = await User.find({}).sort({ createdAt: 1 });
    
    console.log(`Found ${users.length} users`);
    
    let updatedCount = 0;
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      
      try {
        // Skip if user already has a driver license number
        if (user.driverLicenseNumber && user.driverLicenseNumber.trim() !== '') {
          console.log(`User ${user.email} already has a driver license: ${user.driverLicenseNumber}`);
          continue;
        }
        
        // Generate a test driver license number
        const licenseNumber = generateTestDriverLicenseNumber(i + 1);
        
        // Update the user
        user.driverLicenseNumber = licenseNumber;
        await user.save();
        
        console.log(`Updated user ${user.email} with test license number ${licenseNumber}`);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating user ${user.email}:`, error);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} users with test driver license numbers`);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

// Run the script
const runScript = async () => {
  await connectDB();
  
  try {
    await addTestDriverLicenses();
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

// Execute the script
if (require.main === module) {
  runScript();
}