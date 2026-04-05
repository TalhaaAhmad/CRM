const express = require('express');
const {
  generateLabels,
  downloadLabel,
  previewLabel
} = require('../controllers/courierController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/generate-labels', protect, generateLabels);
// Note: Some endpoints might need to be unprotected if downloaded directly from browser without auth header,
// but usually tokens are passed as query params if needed. We'll leave it protected for now based on REST practices.
router.get('/download/:filename', protect, downloadLabel);
router.get('/preview/:orderId', protect, previewLabel);

module.exports = router;
