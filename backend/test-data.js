const mongoose = require('mongoose');
require('dotenv').config();
const Fine = require('./models/Fine');
const Payment = require('./models/Payment');
const User = require('./models/User');
const OffenseType = require('./models/OffenseType');

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
    // Count documents in each collection
    const userCount = await User.countDocuments();
    const fineCount = await Fine.countDocuments();
    const paymentCount = await Payment.countDocuments();
    const offenseTypeCount = await OffenseType.countDocuments();
    
    console.log('Database counts:');
    console.log('Users:', userCount);
    console.log('Fines:', fineCount);
    console.log('Payments:', paymentCount);
    console.log('Offense Types:', offenseTypeCount);
    
    // Get sample data
    if (userCount > 0) {
      const users = await User.find({}).limit(5);
      console.log('Sample users:', users);
    }
    
    if (fineCount > 0) {
      const fines = await Fine.find({}).populate('offenseTypeId').populate('officerId', 'firstName lastName email').limit(5);
      console.log('Sample fines:', fines);
    }
    
    if (paymentCount > 0) {
      const payments = await Payment.find({}).populate({
        path: 'fineId',
        populate: [
          { path: 'offenseTypeId' },
          { path: 'officerId', select: 'firstName lastName' }
        ]
      }).limit(5);
      console.log('Sample payments:', payments);
    }
    
    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error checking database:', error);
    mongoose.connection.close();
  }
});