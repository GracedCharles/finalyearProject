const Fine = require('../models/Fine');
const Payment = require('../models/Payment');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const OffenseType = require('../models/OffenseType');

// Get all fines (admin)
const getAllFines = async (req, res) => {
  try {
    const { page = 1, limit = 10, officerId, status, startDate, endDate, search } = req.query;
    
    // Build filter
    const filter = {};
    
    if (officerId) {
      filter.officerId = officerId;
    }
    
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
      .populate('officerId', 'firstName lastName email')
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
    console.error('Error fetching all fines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all payments (admin)
const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate, search } = req.query;
    
    // Build filter
    const filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.paidAt = {};
      if (startDate) {
        filter.paidAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.paidAt.$lte = new Date(endDate);
      }
    }
    
    if (search) {
      filter.$or = [
        { paymentId: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(filter)
      .populate({
        path: 'fineId',
        populate: [
          { path: 'offenseTypeId' },
          { path: 'officerId', select: 'firstName lastName' }
        ]
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ paidAt: -1 });

    const total = await Payment.countDocuments(filter);

    res.json({
      payments,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get officer activities (audit logs)
const getOfficerActivities = async (req, res) => {
  try {
    const { page = 1, limit = 10, officerId, startDate, endDate, search } = req.query;
    
    // Build filter
    const filter = {};
    
    if (officerId) {
      filter.userId = officerId;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }
    
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const activities = await AuditLog.find(filter)
      .populate('userId', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments(filter);

    res.json({
      activities,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching officer activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Generate reports
const generateReport = async (req, res) => {
  try {
    const { reportType, period, startDate, endDate, format = 'json' } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }
    } else if (period) {
      // Set date filter based on period
      const now = new Date();
      switch (period) {
        case 'daily':
          dateFilter.$gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'weekly':
          const weekAgo = new Date(now);
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateFilter.$gte = weekAgo;
          break;
        case 'monthly':
          dateFilter.$gte = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          break;
      }
    }

    let reportData = {};

    switch (reportType) {
      case 'fines':
        // Get fines issued report
        const finesFilter = dateFilter.$gte ? { issuedAt: dateFilter } : {};
        const fines = await Fine.find(finesFilter);
        
        // Group by officer
        const finesByOfficer = {};
        for (const fine of fines) {
          const officerId = fine.officerId.toString();
          if (!finesByOfficer[officerId]) {
            finesByOfficer[officerId] = {
              officerId,
              count: 0,
              totalAmount: 0
            };
          }
          finesByOfficer[officerId].count++;
          finesByOfficer[officerId].totalAmount += fine.fineAmount;
        }

        // Populate officer details
        const officerIds = Object.keys(finesByOfficer);
        const officers = await User.find({ _id: { $in: officerIds } });
        
        for (const officer of officers) {
          const officerId = officer._id.toString();
          if (finesByOfficer[officerId]) {
            finesByOfficer[officerId].officerName = `${officer.firstName} ${officer.lastName}`;
          }
        }

        reportData = {
          type: 'fines',
          period,
          data: Object.values(finesByOfficer)
        };
        break;

      case 'revenue':
        // Get revenue report
        const paymentsFilter = dateFilter.$gte ? { paidAt: dateFilter } : {};
        const payments = await Payment.find(paymentsFilter);
        
        const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
        const pendingFines = await Fine.countDocuments({ status: 'PENDING' });
        const pendingAmount = await Fine.aggregate([
          { $match: { status: 'PENDING' } },
          { $group: { _id: null, total: { $sum: '$fineAmount' } } }
        ]);

        reportData = {
          type: 'revenue',
          period,
          totalRevenue,
          pendingFines,
          pendingAmount: pendingAmount.length > 0 ? pendingAmount[0].total : 0
        };
        break;

      case 'officer-performance':
        // Get officer performance report
        const performanceFilter = dateFilter.$gte ? { issuedAt: dateFilter } : {};
        const allFines = await Fine.find(performanceFilter).populate('officerId', 'firstName lastName');
        
        // Group by officer
        const performanceData = {};
        for (const fine of allFines) {
          const officerId = fine.officerId._id.toString();
          if (!performanceData[officerId]) {
            performanceData[officerId] = {
              officerId,
              officerName: `${fine.officerId.firstName} ${fine.officerId.lastName}`,
              finesIssued: 0,
              totalAmount: 0,
              finesPaid: 0,
              paidAmount: 0
            };
          }
          performanceData[officerId].finesIssued++;
          performanceData[officerId].totalAmount += fine.fineAmount;
          
          if (fine.status === 'PAID') {
            performanceData[officerId].finesPaid++;
            performanceData[officerId].paidAmount += fine.fineAmount;
          }
        }

        // Calculate collection rates
        Object.values(performanceData).forEach(officer => {
          officer.collectionRate = officer.finesIssued > 0 ? 
            (officer.finesPaid / officer.finesIssued) * 100 : 0;
        });

        reportData = {
          type: 'officer-performance',
          period,
          data: Object.values(performanceData)
        };
        break;

      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    // Handle export format
    if (format === 'csv') {
      // For simplicity, we'll return JSON even for CSV format in this example
      // In a real implementation, you would convert to CSV format
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=report-${reportType}-${Date.now()}.csv`);
      res.json(reportData);
    } else {
      res.json(reportData);
    }
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get user list
const getUserList = async (req, res) => {
  try {
    const users = await User.find({}).select('-clerkId');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Add user
const addUser = async (req, res) => {
  try {
    // In a real implementation, this would integrate with Clerk to create a user
    // For now, we'll just create a user record
    const { email, firstName, lastName, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const newUser = new User({
      email,
      firstName,
      lastName,
      role: role || 'clerk',
      // In a real implementation, we would get the clerkId from Clerk
      clerkId: `temp_${Date.now()}` 
    });
    
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Remove user
const removeUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would also remove the user from Clerk
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error removing user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real implementation, this would integrate with Clerk to reset password
    // For now, we'll just return a success message
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Password reset instructions sent to user' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    // Get total counts
    const totalFines = await Fine.countDocuments();
    const totalPayments = await Payment.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Get recent activity counts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentFines = await Fine.countDocuments({
      issuedAt: { $gte: thirtyDaysAgo }
    });
    
    const recentPayments = await Payment.countDocuments({
      paidAt: { $gte: thirtyDaysAgo }
    });
    
    // Get revenue statistics
    const paidFines = await Fine.find({ status: 'PAID' }).select('fineAmount');
    const totalRevenue = paidFines.reduce((sum, fine) => sum + fine.fineAmount, 0);
    
    const pendingFines = await Fine.find({ status: 'PENDING' }).select('fineAmount');
    const pendingAmount = pendingFines.reduce((sum, fine) => sum + fine.fineAmount, 0);
    
    res.json({
      totalFines,
      totalPayments,
      totalUsers,
      recentFines,
      recentPayments,
      totalRevenue,
      pendingAmount
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllFines,
  getAllPayments,
  getOfficerActivities,
  generateReport,
  getUserList,
  addUser,
  removeUser,
  resetPassword,
  getSystemStats
};