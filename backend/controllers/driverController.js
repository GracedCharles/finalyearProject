const Fine = require('../models/Fine');
const Payment = require('../models/Payment');
const User = require('../models/User');

// Get driver by license number
const getDriverByLicense = async (req, res) => {
  try {
    const { licenseNumber } = req.params;
    
    if (!licenseNumber) {
      return res.status(400).json({ error: 'License number is required' });
    }

    // Find user by driver license number
    const driver = await User.findOne({ driverLicenseNumber: licenseNumber });
    
    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Return only necessary driver information
    res.json({
      _id: driver._id,
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      driverLicenseNumber: driver.driverLicenseNumber
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a fine by fine ID
const getFineByFineId = async (req, res) => {
  try {
    const { fineId } = req.params;

    const fine = await Fine.findOne({ fineId })
      .populate('offenseTypeId')
      .populate('officerId', 'firstName lastName');

    if (!fine) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    res.json(fine);
  } catch (error) {
    console.error('Error fetching fine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Search fines by driver license number
const searchFines = async (req, res) => {
  try {
    const { driverLicenseNumber, page = 1, limit = 10 } = req.query;
    
    if (!driverLicenseNumber) {
      return res.status(400).json({ error: 'Driver license number is required' });
    }

    const fines = await Fine.find({ driverLicenseNumber })
      .populate('offenseTypeId')
      .populate('officerId', 'firstName lastName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ issuedAt: -1 });

    const total = await Fine.countDocuments({ driverLicenseNumber });

    res.json({
      fines,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error searching fines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get payment history for a driver
const getPaymentHistory = async (req, res) => {
  try {
    const { driverLicenseNumber } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Find fines for this driver
    const fines = await Fine.find({ driverLicenseNumber })
      .select('_id');
    
    const fineIds = fines.map(fine => fine._id);

    // Find payments for these fines
    const payments = await Payment.find({ fineId: { $in: fineIds } })
      .populate({
        path: 'fineId',
        populate: {
          path: 'offenseTypeId'
        }
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ paidAt: -1 });

    const total = await Payment.countDocuments({ fineId: { $in: fineIds } });

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Process payment for a fine
const processPayment = async (req, res) => {
  try {
    const { fineId, paymentMethod, transactionId, payerId } = req.body;

    // Find the fine
    const fine = await Fine.findOne({ fineId });
    if (!fine) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    // Check if fine is already paid
    if (fine.status === 'PAID') {
      return res.status(400).json({ error: 'Fine is already paid' });
    }

    // Create payment record
    const paymentId = `PY${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const payment = new Payment({
      paymentId,
      fineId: fine._id,
      amount: fine.fineAmount,
      paymentMethod,
      transactionId,
      payerId,
      status: 'SUCCESS',
      paidAt: new Date()
    });

    await payment.save();

    // Update fine status
    fine.status = 'PAID';
    fine.paymentId = payment._id;
    await fine.save();

    res.status(200).json({ 
      message: 'Payment processed successfully',
      payment,
      fine
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get driver dashboard statistics
const getDriverDashboardStats = async (req, res) => {
  try {
    // For drivers, we'll get stats based on their license number
    // In a real implementation, you would get this from the authenticated user's profile
    // For now, we'll use a placeholder - in a real app, you would get this from the user's profile
    const driverLicenseNumber = req.query.driverLicenseNumber || 'DL001'; // Placeholder
    
    // Active fines (pending)
    const activeFines = await Fine.countDocuments({
      driverLicenseNumber,
      status: 'PENDING'
    });

    // Overdue fines
    const now = new Date();
    const overdueFines = await Fine.countDocuments({
      driverLicenseNumber,
      status: 'PENDING',
      dueDate: { $lt: now }
    });

    // Total paid amount
    const paidFines = await Fine.find({
      driverLicenseNumber,
      status: 'PAID'
    }).select('fineAmount');

    const totalPaid = paidFines.reduce((sum, fine) => sum + fine.fineAmount, 0);

    // Total outstanding (pending fines)
    const pendingFines = await Fine.find({
      driverLicenseNumber,
      status: 'PENDING'
    }).select('fineAmount');

    const totalOutstanding = pendingFines.reduce((sum, fine) => sum + fine.fineAmount, 0);

    res.json({
      activeFines,
      overdueFines,
      totalPaid,
      totalOutstanding
    });
  } catch (error) {
    console.error('Error fetching driver dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getDriverByLicense,
  getFineByFineId,
  searchFines,
  getPaymentHistory,
  processPayment,
  getDriverDashboardStats
};