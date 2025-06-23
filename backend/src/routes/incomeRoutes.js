const express = require('express');
const Joi = require('joi');
const incomeController = require('../controllers/incomeController');
const authMiddleware = require('../middleware/auth');
const { validateRequest, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createIncomeSchema = Joi.object({
  source: Joi.string().trim().max(200).required(),
  description: Joi.string().trim().max(500).required(),
  amount: Joi.number().positive().required(),
  category: Joi.string().valid('freelance', 'consulting', 'products', 'services', 'investment', 'other').required(),
  platform: Joi.string().valid('upwork', 'fiverr', 'stripe', 'paypal', 'bank', 'cash', 'other').optional(),
  invoiceNumber: Joi.string().trim().optional(),
  date: Joi.date().optional(),
  isRecurring: Joi.boolean().optional(),
  taxable: Joi.boolean().optional()
});

const updateIncomeSchema = Joi.object({
  source: Joi.string().trim().max(200).optional(),
  description: Joi.string().trim().max(500).optional(),
  amount: Joi.number().positive().optional(),
  category: Joi.string().valid('freelance', 'consulting', 'products', 'services', 'investment', 'other').optional(),
  platform: Joi.string().valid('upwork', 'fiverr', 'stripe', 'paypal', 'bank', 'cash', 'other').optional(),
  invoiceNumber: Joi.string().trim().optional().allow(''),
  date: Joi.date().optional(),
  isRecurring: Joi.boolean().optional(),
  taxable: Joi.boolean().optional()
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  category: Joi.string().valid('freelance', 'consulting', 'products', 'services', 'investment', 'other').optional(),
  search: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  sortBy: Joi.string().valid('date', 'amount', 'source', 'createdAt').optional(),
  sortOrder: Joi.string().valid('asc', 'desc').optional()
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.get('/', validateQuery(querySchema), incomeController.getIncomes);
router.post('/', validateRequest(createIncomeSchema), incomeController.createIncome);
router.get('/:id', incomeController.getIncome);
router.put('/:id', validateRequest(updateIncomeSchema), incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

module.exports = router; 