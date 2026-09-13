const express = require('express');
const { z } = require('zod');
const authController = require('./auth.controller');
const validate = require('../../middleware/validate');

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  fcm: z.string().optional(),
});

const { protect } = require('../../middleware/auth.middleware');
const { sendSuccess } = require('../../utils/response');

// Public routes
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

// Current user profile convenience aliases
router.get('/profile', protect, (req, res) => {
  sendSuccess(res, req.user, 'User details retrieved successfully');
});
router.get('/getprofile', protect, (req, res) => {
  sendSuccess(res, req.user, 'User details retrieved successfully');
});
router.get('/me', protect, (req, res) => {
  sendSuccess(res, req.user, 'User details retrieved successfully');
});

module.exports = router;
