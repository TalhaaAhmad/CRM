const express = require('express');
const {
  getDashboardStats,
  getQuickStats
} = require('../controllers/dashboardController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/', protect, getDashboardStats);
router.get('/quick-stats', protect, getQuickStats);

module.exports = router;
