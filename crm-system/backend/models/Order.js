const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Please add customer name'],
    trim: true,
    maxlength: [100, 'Customer name cannot be more than 100 characters'],
  },
  phone: {
    type: String,
    required: [true, 'Please add phone number'],
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters'],
  },
  address: {
    type: String,
    required: [true, 'Please add address'],
    trim: true,
    maxlength: [500, 'Address cannot be more than 500 characters'],
  },
  city: {
    type: String,
    required: [true, 'Please add city'],
    trim: true,
    maxlength: [50, 'City cannot be more than 50 characters'],
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  orderAmount: {
    type: Number,
    default: 0,
  },
  products: [
    {
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
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
OrderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
