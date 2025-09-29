const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  fineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fine',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['AIRTEL_MONEY', 'TNM_MPAMBA', 'VISA', 'BANK_TRANSFER'],
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
  payerId: {
    type: String, // Could be driver license number or mobile number
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
    default: 'PENDING',
  },
  paidAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Payment', paymentSchema);