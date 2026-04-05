const express = require('express');
const {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  updateStatus,
  getEmployeeStats
} = require('../controllers/employeeController');

const router = express.Router();

const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure memory storage for Base64 conversion
const storage = multer.memoryStorage();

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 } // 1MB limit for MongoDB storage
});



router.get('/stats/overview', protect, getEmployeeStats);

router
  .route('/')
  .get(protect, getEmployees)
  .post(protect, upload.single('photo'), createEmployee);

router
  .route('/:id')
  .get(protect, getEmployee)
  .put(protect, upload.single('photo'), updateEmployee)
  .delete(protect, deleteEmployee);

router.put('/:id/status', protect, updateStatus);

module.exports = router;
