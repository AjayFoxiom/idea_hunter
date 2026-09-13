const express = require('express');
const userController = require('./user.controller');
const { protect, authorize } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

// Current user profile (reads userId from token)
router.get('/profile', userController.getProfile);
router.get('/getprofile', userController.getProfile);
router.get('/me', userController.getProfile);
router.patch('/profile', userController.updateMe);
router.patch('/me', userController.updateMe);

// User by ID (accessible by self or superAdmin)
router.get('/:id', userController.getUserById);
router.patch('/:id', userController.updateUser);

// superAdmin user management
router.get('/', authorize('superAdmin'), userController.listUsers);
router.get('/users', authorize('superAdmin'), userController.listUsers);
router.delete('/:id', authorize('superAdmin'), userController.deleteUser);
router.delete('/users/:id', authorize('superAdmin'), userController.deleteUser);

module.exports = router;
