const express = require('express');
const Joi = require('joi');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');
const { validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const yearQuerySchema = Joi.object({
  year: Joi.number().integer().min(2020).max(2030).optional()
});

const exportQuerySchema = Joi.object({
  year: Joi.number().integer().min(2020).max(2030).optional(),
  format: Joi.string().valid('json', 'csv').optional(),
  type: Joi.string().valid('all', 'income', 'expenses').optional()
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Report routes
router.get('/annual', validateQuery(yearQuerySchema), reportController.generateAnnualReport);
router.get('/summary', reportController.getReportSummary);
router.get('/export', validateQuery(exportQuerySchema), reportController.exportData);

module.exports = router; 