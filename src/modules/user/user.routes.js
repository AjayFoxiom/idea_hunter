const express = require('express');
const { z } = require('zod');
const userController = require('./user.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

// superAdmin-only user management
router.get('/users', protect, authorize('superAdmin'), userController.listUsers);
router.patch('/users/:id', protect, authorize('superAdmin'), userController.updateUser);
router.delete('/users/:id', protect, authorize('superAdmin'), userController.deleteUser);

module.exports = router;
