const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');

  try {
    // Look for all users with driver license numbers containing "121314"
    const users = await User.find({ driverLicenseNumber: { $regex: '121314' } });
    
    if (users.length > 0) {
      console.log('Users with license numbers containing "121314":');
      users.forEach(user => {
        console.log('----------------------------------------');
        console.log('User ID:', user._id);
        console.log('First Name:', user.firstName);
        console.log('Last Name:', user.lastName);
        console.log('Email:', user.email);
        console.log('Driver License Number:', user.driverLicenseNumber);
        console.log('Role:', user.role);
      });
    } else {
      console.log('No users found with license numbers containing "121314"');
    }
    
    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error checking database:', error);
    mongoose.connection.close();
  }
});