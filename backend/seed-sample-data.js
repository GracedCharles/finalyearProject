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
    // First, make sure we have offense types
    const offenseTypeCount = await OffenseType.countDocuments();
    if (offenseTypeCount === 0) {
      console.log('No offense types found, seeding...');
      
      const offenseTypes = [
        {
          code: 'SPD001',
          description: 'Speeding - Exceeding limit by 10-20 km/h',
          amount: 1000,
          category: 'Speeding'
        },
        {
          code: 'SPD002',
          description: 'Speeding - Exceeding limit by 21-30 km/h',
          amount: 2000,
          category: 'Speeding'
        },
        {
          code: 'TRL001',
          description: 'Running red light',
          amount: 2500,
          category: 'Traffic Signals'
        },
        {
          code: 'PARK001',
          description: 'Illegal parking',
          amount: 1500,
          category: 'Parking'
        }
      ];

      await OffenseType.insertMany(offenseTypes);
      console.log('Seeded offense types successfully');
    }

    // Get users (need at least one officer to create fines)
    const users = await User.find({});
    if (users.length === 0) {
      console.log('No users found, please run seed.js first');
      mongoose.connection.close();
      return;
    }

    // Find an officer user (not admin)
    let officerUser = users.find(user => user.role === 'clerk' || user.role === 'officer');
    if (!officerUser) {
      // If no officer found, use the first non-admin user
      officerUser = users.find(user => user.role !== 'admin') || users[0];
    }

    console.log('Using officer user:', officerUser.email);

    // Get some offense types
    const offenseTypes = await OffenseType.find({}).limit(3);
    if (offenseTypes.length === 0) {
      console.log('No offense types available');
      mongoose.connection.close();
      return;
    }

    // Clear existing fines and payments for clean seeding
    await Fine.deleteMany({});
    await Payment.deleteMany({});
    console.log('Cleared existing fines and payments');

    // Create sample fines
    const sampleFines = [];
    const now = new Date();
    
    for (let i = 0; i < 15; i++) {
      const randomOffense = offenseTypes[Math.floor(Math.random() * offenseTypes.length)];
      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days
      
      // Random status
      const statuses = ['PENDING', 'PAID', 'OVERDUE'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      sampleFines.push({
        fineId: `FINE-${Date.now()}-${i}`,
        driverLicenseNumber: `DL${10000 + i}`,
        driverName: `Driver ${i + 1}`,
        vehicleRegistration: `REG${20000 + i}`,
        offenseTypeId: randomOffense._id,
        offenseDetails: randomOffense.description,
        fineAmount: randomOffense.amount,
        officerId: officerUser._id,
        issuedAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
        dueDate: dueDate,
        status: status
      });
    }

    await Fine.insertMany(sampleFines);
    console.log('Seeded 15 sample fines');

    // Create some sample payments for PAID fines
    const paidFines = await Fine.find({ status: 'PAID' }).limit(8);
    const samplePayments = [];
    
    for (let i = 0; i < paidFines.length; i++) {
      const fine = paidFines[i];
      const paidAt = new Date(fine.issuedAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // Paid within 7 days of issue
      
      samplePayments.push({
        paymentId: `PAY-${Date.now()}-${i}`,
        fineId: fine._id,
        amount: fine.fineAmount,
        paymentMethod: ['AIRTEL_MONEY', 'TNM_MPAMBA', 'BANK_TRANSFER'][Math.floor(Math.random() * 3)],
        transactionId: `TXN-${Date.now()}-${i}`,
        payerId: fine.driverLicenseNumber,
        status: 'SUCCESS',
        paidAt: paidAt
      });
    }

    if (samplePayments.length > 0) {
      await Payment.insertMany(samplePayments);
      console.log(`Seeded ${samplePayments.length} sample payments`);
      
      // Update the corresponding fines with payment IDs
      for (const payment of samplePayments) {
        await Fine.findByIdAndUpdate(payment.fineId, { paymentId: payment._id });
      }
      console.log('Updated fines with payment IDs');
    }

    // Verify the data
    const fineCount = await Fine.countDocuments();
    const paymentCount = await Payment.countDocuments();
    
    console.log('Final counts:');
    console.log('Fines:', fineCount);
    console.log('Payments:', paymentCount);

    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding sample data:', error);
    mongoose.connection.close();
  }
});