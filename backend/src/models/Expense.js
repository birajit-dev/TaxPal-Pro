const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
      values: [
        'office-supplies', 'software', 'marketing', 'travel', 
        'meals', 'home-office', 'internet', 'insurance', 
        'professional', 'education', 'equipment', 'other'
      ],
      message: 'Invalid category'
    }
  },
  paymentMethod: {
    type: String,
    enum: ['credit-card', 'debit-card', 'bank-transfer', 'cash', 'paypal', 'other'],
    default: 'credit-card'
  },
  receiptUrl: {
    type: String,
    default: null
  },
  vendor: {
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
  isDeductible: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better performance
ExpenseSchema.index({ userId: 1, date: -1 });
ExpenseSchema.index({ userId: 1, category: 1 });
ExpenseSchema.index({ userId: 1, isDeductible: 1 });
ExpenseSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Expense', ExpenseSchema); 