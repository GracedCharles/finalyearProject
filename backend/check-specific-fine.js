const mongoose = require('mongoose');
require('dotenv').config();
const Fine = require('./models/Fine');

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
    // Look for the specific fine that's causing issues
    const fineId = '68da2823ed885ac3166c0625';
    const fine = await Fine.findById(fineId);
    
    if (fine) {
      console.log('Found fine:');
      console.log('Fine ID:', fine.fineId);
      console.log('Driver License Number:', fine.driverLicenseNumber);
      console.log('Driver Name:', fine.driverName);
      console.log('Status:', fine.status);
      
      // Check if there's a user with this license number
      const User = require('./models/User');
      const user = await User.findOne({ driverLicenseNumber: fine.driverLicenseNumber });
      
      if (user) {
        console.log('Associated user found:');
        console.log('User ID:', user._id);
        console.log('User name:', user.firstName, user.lastName);
        console.log('User email:', user.email);
      } else {
        console.log('No user found with license number:', fine.driverLicenseNumber);
        
        // Let's check what users exist
        const users = await User.find({ role: 'driver' }).select('driverLicenseNumber firstName lastName email');
        console.log('All driver users:');
        users.forEach(u => {
          console.log(`  ${u.driverLicenseNumber} - ${u.firstName} ${u.lastName} (${u.email})`);
        });
      }
    } else {
      console.log('Fine not found with ID:', fineId);
      
      // Let's check what fines exist
      const fines = await Fine.find({}).select('fineId driverLicenseNumber driverName status').limit(10);
      console.log('Recent fines:');
      fines.forEach(f => {
        console.log(`  ${f.fineId} - ${f.driverLicenseNumber} - ${f.driverName} - ${f.status}`);
      });
    }
    
    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error checking database:', error);
    mongoose.connection.close();
  }
});