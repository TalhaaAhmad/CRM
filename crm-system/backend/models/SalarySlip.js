const mongoose = require('mongoose');

const SalarySlipSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.ObjectId,
    ref: 'Employee',
    required: true,
  },
  month: {
    type: String,
    required: [true, 'Please add month'],
    match: [
      /^\d{4}-\d{2}$/,
      'Please use format YYYY-MM (e.g., 2024-01)',
    ],
  },
  basicSalary: {
    type: Number,
    required: [true, 'Please add basic salary'],
    min: [0, 'Basic salary cannot be negative'],
  },
  workingDays: {
    type: Number,
    default: 0,
  },
  advance: {
    type: Number,
    default: 0,
  },
  bonus: {
    type: Number,
    default: 0,
  },
  overtime: {
    hours: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
  },
  grossSalary: {
    type: Number,
    required: true,
  },
  totalDeductions: {
    type: Number,
    required: true,
  },
  netSalary: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['bank-transfer', 'cash', 'check'],
    default: 'bank-transfer',
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    branch: String,
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
  },
  status: {
    type: String,
    enum: ['draft', 'generated', 'paid'],
    default: 'draft',
  },
  paidDate: {
    type: Date,
  },
  generatedBy: {
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

// Calculate totals before validation to satisfy 'required' fields
SalarySlipSchema.pre('validate', function (next) {
  // Calculate overtime amount
  this.overtime.amount = (this.overtime.hours || 0) * (this.overtime.rate || 0);

  // Calculate gross salary (earnings)
  this.grossSalary = (this.basicSalary || 0) + (this.bonus || 0) + (this.overtime.amount || 0);

  // Calculate total deductions
  this.totalDeductions = (this.advance || 0);

  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions;

  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SalarySlip', SalarySlipSchema);
