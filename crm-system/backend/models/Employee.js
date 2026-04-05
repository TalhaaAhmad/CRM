const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add employee name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  email: {
    type: String,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters'],
  },
  role: {
    type: String,
    required: [true, 'Please add role'],
    trim: true,
    maxlength: [50, 'Role cannot be more than 50 characters'],
  },
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Department cannot be more than 50 characters'],
    default: 'General',
  },
  salary: {
    type: Number,
    required: [true, 'Please add salary'],
    min: [0, 'Salary cannot be negative'],
  },
  joiningDate: {
    type: Date,
    required: [true, 'Please add joining date'],
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-leave'],
    default: 'active',
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot be more than 500 characters'],
  },
  cnic: {
    type: String,
    trim: true,
    maxlength: [20, 'CNIC cannot be more than 20 characters'],
  },
  photo: {
    type: String,
    default: '',
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field on save
EmployeeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Employee', EmployeeSchema);
