const Fine = require('../models/Fine');
const Payment = require('../models/Payment');

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

module.exports = {
  getFineByFineId,
  searchFines,
  getPaymentHistory,
  processPayment
};