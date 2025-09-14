const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  fineId: {
    type: String,
    required: true,
    unique: true,
  },
  driverLicenseNumber: {
    type: String,
    required: true,
  },
  driverName: {
    type: String,
    required: true,
  },
  vehicleRegistration: {
    type: String,
    required: true,
  },
  offenseTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OffenseType',
    required: true,
  },
  offenseDetails: {
    type: String,
    required: true,
  },
  fineAmount: {
    type: Number,
    required: true,
  },
  officerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'OVERDUE'],
    default: 'PENDING',
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Fine', fineSchema);