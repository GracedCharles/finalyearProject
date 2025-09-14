const Fine = require('../models/Fine');
const OffenseType = require('../models/OffenseType');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const Payment = require('../models/Payment');

// Generate a unique fine ID
const generateFineId = () => {
  const prefix = 'FN';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Generate a unique payment ID
const generatePaymentId = () => {
  const prefix = 'PY';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// Issue a new fine
const issueFine = async (req, res) => {
  try {
    const { 
      driverLicenseNumber,
      driverName,
      vehicleRegistration,
      offenseTypeId,
      dueDate
    } = req.body;

    // Get the authenticated officer
    const officer = await User.findOne({ clerkId: req.auth.userId });
    if (!officer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    // Get offense type details
    const offenseType = await OffenseType.findById(offenseTypeId);
    if (!offenseType) {
      return res.status(404).json({ error: 'Offense type not found' });
    }

    // Create the fine
    const fineId = generateFineId();
    const fine = new Fine({
      fineId,
      driverLicenseNumber,
      driverName,
      vehicleRegistration,
      offenseTypeId,
      offenseDetails: offenseType.description,
      fineAmount: offenseType.amount,
      officerId: officer._id,
      dueDate,
    });

    await fine.save();

    // Log the action
    await AuditLog.create({
      userId: officer._id,
      action: 'ISSUE_FINE',
      description: `Issued fine ${fineId} to driver ${driverLicenseNumber}`,
      metadata: { fineId: fine._id }
    });

    res.status(201).json(fine);
  } catch (error) {
    console.error('Error issuing fine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get dashboard statistics for officer
const getDashboardStats = async (req, res) => {
  try {
    const officer = await User.findOne({ clerkId: req.auth.userId });
    if (!officer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fines issued today
    const finesToday = await Fine.countDocuments({
      officerId: officer._id,
      issuedAt: { $gte: today }
    });

    // Pending payments
    const pendingFines = await Fine.countDocuments({
      officerId: officer._id,
      status: 'PENDING'
    });

    // Total collected (paid fines)
    const paidFines = await Fine.find({
      officerId: officer._id,
      status: 'PAID'
    }).select('fineAmount');

    const totalCollected = paidFines.reduce((sum, fine) => sum + fine.fineAmount, 0);

    res.json({
      finesToday,
      pendingFines,
      totalCollected
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all fines issued by the officer
const getOfficerFines = async (req, res) => {
  try {
    const officer = await User.findOne({ clerkId: req.auth.userId });
    if (!officer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    const { page = 1, limit = 10, status, startDate, endDate, search } = req.query;
    
    // Build filter
    const filter = { officerId: officer._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.issuedAt = {};
      if (startDate) {
        filter.issuedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.issuedAt.$lte = new Date(endDate);
      }
    }
    
    if (search) {
      filter.$or = [
        { driverLicenseNumber: { $regex: search, $options: 'i' } },
        { vehicleRegistration: { $regex: search, $options: 'i' } },
        { fineId: { $regex: search, $options: 'i' } }
      ];
    }

    const fines = await Fine.find(filter)
      .populate('offenseTypeId')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ issuedAt: -1 });

    const total = await Fine.countDocuments(filter);

    res.json({
      fines,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching officer fines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific fine by ID
const getFineById = async (req, res) => {
  try {
    const officer = await User.findOne({ clerkId: req.auth.userId });
    if (!officer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    const fine = await Fine.findOne({ 
      _id: req.params.id,
      officerId: officer._id 
    }).populate('offenseTypeId');

    if (!fine) {
      return res.status(404).json({ error: 'Fine not found' });
    }

    res.json(fine);
  } catch (error) {
    console.error('Error fetching fine:', error);
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
    const paymentId = generatePaymentId();
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

    // Log the action
    await AuditLog.create({
      userId: fine.officerId,
      action: 'PROCESS_PAYMENT',
      description: `Processed payment ${paymentId} for fine ${fineId}`,
      metadata: { fineId: fine._id, paymentId: payment._id }
    });

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

// Get analytics data for officer
const getAnalytics = async (req, res) => {
  try {
    const officer = await User.findOne({ clerkId: req.auth.userId });
    if (!officer) {
      return res.status(404).json({ error: 'Officer not found' });
    }

    const { period = 'monthly' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'weekly':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
    }

    // Get fines issued over time
    const finesOverTime = await Fine.aggregate([
      {
        $match: {
          officerId: officer._id,
          issuedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'daily' ? '%Y-%m-%d' : period === 'weekly' ? '%Y-%W' : '%Y-%m',
              date: '$issuedAt'
            }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$fineAmount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get payment statistics
    const paidFines = await Fine.find({
      officerId: officer._id,
      status: 'PAID'
    }).select('fineAmount');

    const totalCollected = paidFines.reduce((sum, fine) => sum + fine.fineAmount, 0);
    const totalFines = await Fine.countDocuments({ officerId: officer._id });
    const collectionRate = totalFines > 0 ? (paidFines.length / totalFines) * 100 : 0;

    res.json({
      finesOverTime,
      totalFines,
      totalCollected,
      collectionRate
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  issueFine,
  getDashboardStats,
  getOfficerFines,
  getFineById,
  processPayment,
  getAnalytics
};