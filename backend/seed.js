const mongoose = require('mongoose');
require('dotenv').config();
const OffenseType = require('./models/OffenseType');
const User = require('./models/User');

// Check if MONGODB_URI is defined
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in .env file');
  process.exit(1);
}

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
    // Clear existing offense types
    await OffenseType.deleteMany({});
    console.log('Cleared existing offense types');

    // Define initial offense types
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
        code: 'SPD003',
        description: 'Speeding - Exceeding limit by 31-40 km/h',
        amount: 3000,
        category: 'Speeding'
      },
      {
        code: 'SPD004',
        description: 'Speeding - Exceeding limit by 41+ km/h',
        amount: 5000,
        category: 'Speeding'
      },
      {
        code: 'TRL001',
        description: 'Running red light',
        amount: 2500,
        category: 'Traffic Signals'
      },
      {
        code: 'TRL002',
        description: 'Running stop sign',
        amount: 2000,
        category: 'Traffic Signals'
      },
      {
        code: 'PARK001',
        description: 'Illegal parking',
        amount: 1500,
        category: 'Parking'
      },
      {
        code: 'PARK002',
        description: 'Parking in disabled zone without permit',
        amount: 3000,
        category: 'Parking'
      },
      {
        code: 'DRV001',
        description: 'Driving without license',
        amount: 4000,
        category: 'Documentation'
      },
      {
        code: 'DRV002',
        description: 'Driving with expired license',
        amount: 2000,
        category: 'Documentation'
      },
      {
        code: 'VEH001',
        description: 'Driving vehicle with expired registration',
        amount: 3000,
        category: 'Documentation'
      },
      {
        code: 'VEH002',
        description: 'Driving unregistered vehicle',
        amount: 5000,
        category: 'Documentation'
      }
    ];

    // Insert offense types
    await OffenseType.insertMany(offenseTypes);
    console.log('Seeded offense types successfully');

    // Check if admin user exists, if not create one
    // Note: This is a placeholder admin user. In production, you would manually 
    // create admin users or have a more sophisticated admin creation process.
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      const newAdmin = new User({
        clerkId: 'user_32m5DkVTrjmf4CuK3tappLcJmYl', // This matches the Clerk user ID from your logs
        email: 'isaacmonawe6@gmail.com', // This matches the email from your logs
        firstName: 'Isaac',
        lastName: 'Monawe',
        role: 'admin', // Set as admin
        isActive: true
      });
      
      await newAdmin.save();
      console.log('Created default admin user with Clerk ID:', newAdmin.clerkId);
    } else {
      console.log('Admin user already exists with email:', adminUser.email);
      
      // Update existing user to ensure they have admin role
      if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('Updated user to admin role');
      }
    }

    // Close connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
});