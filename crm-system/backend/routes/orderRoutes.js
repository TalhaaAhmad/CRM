const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  updateStatus,
  getOrderStats
} = require('../controllers/orderController');

const router = express.Router();

const { protect } = require('../middleware/auth');

// Note: Ensure /stats/overview is before /:id so it doesn't get matched as an ID
router.get('/stats/overview', protect, getOrderStats);

router
  .route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router
  .route('/:id')
  .get(protect, getOrder)
  .put(protect, updateOrder)
  .delete(protect, deleteOrder);

router.put('/:id/status', protect, updateStatus);

module.exports = router;
