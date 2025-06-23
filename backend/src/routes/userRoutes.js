const express = require('express');
const Joi = require('joi');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).optional(),
  lastName: Joi.string().trim().min(1).max(50).optional(),
  businessName: Joi.string().trim().max(100).optional().allow('')
});

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.get('/profile', userController.getProfile);
router.put('/profile', validateRequest(updateProfileSchema), userController.updateProfile);

module.exports = router; 