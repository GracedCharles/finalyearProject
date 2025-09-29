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
    // Test the exact query that's failing
    const fineId = 'FN587584849';  // The fine ID from our earlier findings
    const driverLicenseNumber = 'DL-1213145';  // The license number
    
    console.log('Testing query with:');
    console.log('fineId:', fineId);
    console.log('driverLicenseNumber:', driverLicenseNumber);
    
    // Try the exact query
    const fine = await Fine.findOne({ 
      fineId: fineId,
      driverLicenseNumber: driverLicenseNumber
    });
    
    console.log('Direct query result:', fine);
    
    // Try with trimmed values
    const trimmedLicense = driverLicenseNumber.trim();
    console.log('Testing with trimmed license:', trimmedLicense);
    
    const fineTrimmed = await Fine.findOne({ 
      fineId: fineId,
      driverLicenseNumber: trimmedLicense
    });
    
    console.log('Trimmed query result:', fineTrimmed);
    
    // Try case insensitive
    const fineCaseInsensitive = await Fine.findOne({ 
      fineId: fineId,
      driverLicenseNumber: { $regex: new RegExp(`^${driverLicenseNumber}$`, 'i') }
    });
    
    console.log('Case insensitive query result:', fineCaseInsensitive);
    
    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error testing fine lookup:', error);
    mongoose.connection.close();
  }
});