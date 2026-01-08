const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  alternatePhone: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  addresses: [{
    type: {
      type: String,
      enum: ['home', 'office', 'other'],
      default: 'home'
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    accessInstructions: String,
    keyLocation: String
  }],
  preferences: {
    cleaningFrequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'one-time', 'custom'],
      default: 'weekly'
    },
    preferredDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'flexible']
    },
    specialInstructions: String,
    petInfo: String,
    allergyInfo: String
  },
  paymentInfo: {
    preferredMethod: {
      type: String,
      enum: ['cash', 'check', 'credit_card', 'bank_transfer'],
      default: 'credit_card'
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  notes: String,
  tags: [String],
  totalJobsCompleted: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  lastServiceDate: Date,
  nextServiceDate: Date
}, {
  timestamps: true
});

// Virtual for full name
clientSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for default address
clientSchema.virtual('defaultAddress').get(function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

clientSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Client', clientSchema);