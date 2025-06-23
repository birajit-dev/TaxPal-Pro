const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    required: [true, 'Income source is required'],
    trim: true,
    maxlength: [200, 'Source cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  category: {
    type: String,
    required: true,
    enum: {
      values: ['freelance', 'consulting', 'products', 'services', 'investment', 'other'],
      message: 'Category must be one of: freelance, consulting, products, services, investment, other'
    }
  },
  platform: {
    type: String,
    enum: ['upwork', 'fiverr', 'stripe', 'paypal', 'bank', 'cash', 'other'],
    default: 'other'
  },
  invoiceNumber: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  taxable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
IncomeSchema.index({ userId: 1, date: -1 });
IncomeSchema.index({ userId: 1, category: 1 });
IncomeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Income', IncomeSchema); 