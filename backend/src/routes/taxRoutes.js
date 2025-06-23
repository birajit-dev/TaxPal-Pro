const express = require('express');
const Joi = require('joi');
const taxController = require('../controllers/taxController');
const authMiddleware = require('../middleware/auth');
const { validateRequest, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const scenarioSchema = Joi.object({
  additionalIncome: Joi.number().min(0).optional(),
  additionalExpenses: Joi.number().min(0).optional(),
  retirementContribution: Joi.number().min(0).optional(),
  year: Joi.number().integer().min(2020).max(2030).optional()
});

const yearQuerySchema = Joi.object({
  year: Joi.number().integer().min(2020).max(2030).optional()
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Tax estimation routes
router.get('/estimate', validateQuery(yearQuerySchema), taxController.getTaxEstimate);
router.post('/scenario', validateRequest(scenarioSchema), taxController.calculateTaxScenario);
router.get('/quarterly', validateQuery(yearQuerySchema), taxController.getQuarterlySchedule);
router.get('/deadlines', validateQuery(yearQuerySchema), taxController.getTaxDeadlines);

module.exports = router; 