const express = require('express');
const Joi = require('joi');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/auth');
const { validateRequest, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createExpenseSchema = Joi.object({
  description: Joi.string().trim().max(500).required(),
  amount: Joi.number().positive().required(),
  category: Joi.string().valid(
    'office-supplies', 'software', 'marketing', 'travel', 
    'meals', 'home-office', 'internet', 'insurance', 
    'professional', 'education', 'equipment', 'other'
  ).required(),
  paymentMethod: Joi.string().valid('credit-card', 'debit-card', 'bank-transfer', 'cash', 'paypal', 'other').optional(),
  receiptUrl: Joi.string().uri().optional().allow(''),
  vendor: Joi.string().trim().optional(),
  date: Joi.date().optional(),
  isRecurring: Joi.boolean().optional(),
  isDeductible: Joi.boolean().optional(),
  notes: Joi.string().max(1000).optional()
});

const updateExpenseSchema = Joi.object({
  description: Joi.string().trim().max(500).optional(),
  amount: Joi.number().positive().optional(),
  category: Joi.string().valid(
    'office-supplies', 'software', 'marketing', 'travel', 
    'meals', 'home-office', 'internet', 'insurance', 
    'professional', 'education', 'equipment', 'other'
  ).optional(),
  paymentMethod: Joi.string().valid('credit-card', 'debit-card', 'bank-transfer', 'cash', 'paypal', 'other').optional(),
  receiptUrl: Joi.string().uri().optional().allow(''),
  vendor: Joi.string().trim().optional().allow(''),
  date: Joi.date().optional(),
  isRecurring: Joi.boolean().optional(),
  isDeductible: Joi.boolean().optional(),
  notes: Joi.string().max(1000).optional().allow('')
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  category: Joi.string().valid(
    'office-supplies', 'software', 'marketing', 'travel', 
    'meals', 'home-office', 'internet', 'insurance', 
    'professional', 'education', 'equipment', 'other'
  ).optional(),
  search: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  isDeductible: Joi.string().valid('true', 'false').optional(),
  sortBy: Joi.string().valid('date', 'amount', 'description', 'createdAt').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.get('/', validateQuery(querySchema), expenseController.getExpenses);
router.post('/', validateRequest(createExpenseSchema), expenseController.createExpense);
router.get('/:id', expenseController.getExpense);
router.put('/:id', validateRequest(updateExpenseSchema), expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router; 