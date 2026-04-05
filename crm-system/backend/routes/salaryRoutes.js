const express = require('express');
const {
  getSalarySlips,
  getSalarySlip,
  generateSalarySlip,
  updateSalarySlip,
  deleteSalarySlip,
  markAsPaid,
  downloadSalarySlip,
  getSalaryStats
} = require('../controllers/salaryController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.get('/stats/overview', protect, getSalaryStats);
router.post('/generate', protect, generateSalarySlip);

router
  .route('/')
  .get(protect, getSalarySlips);

router
  .route('/:id')
  .get(protect, getSalarySlip)
  .put(protect, updateSalarySlip)
  .delete(protect, deleteSalarySlip);

router.put('/:id/pay', protect, markAsPaid);
router.get('/:id/download', protect, downloadSalarySlip);

module.exports = router;
