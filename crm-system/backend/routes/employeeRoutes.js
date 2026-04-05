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

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `employee-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter for images (jpg, jpeg, png)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
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
