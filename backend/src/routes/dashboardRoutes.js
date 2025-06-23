const express = require('express');
const Joi = require('joi');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');
const { validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const trendsQuerySchema = Joi.object({
  year: Joi.number().integer().min(2020).max(2030).optional()
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.get('/overview', dashboardController.getDashboardOverview);
router.get('/summary', dashboardController.getDashboardSummary);
router.get('/trends', validateQuery(trendsQuerySchema), dashboardController.getMonthlyTrends);

module.exports = router; 