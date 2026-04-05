const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
} = require('../controllers/userController');

const User = require('../models/User');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// All routes here are protected and restricted to Admin
router.use(protect);
router.use(authorize('admin'));

router
  .route('/')
  .get(getUsers)
  .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.put('/:id/resetpassword', resetPassword);

module.exports = router;
