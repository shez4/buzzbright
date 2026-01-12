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
  company: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['residential', 'commercial'],
    default: 'residential'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'prospect'],
    default: 'prospect'
  },
  address: {
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
    country: {
      type: String,
      default: 'USA'
    }
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: 'USA'
    }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  servicePreferences: {
    preferredDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'flexible'],
      default: 'flexible'
    },
    accessInstructions: String,
    specialInstructions: String
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['cash', 'check', 'credit_card', 'bank_transfer', 'invoice'],
      default: 'credit_card'
    },
    terms: {
      type: String,
      enum: ['immediate', 'net_15', 'net_30', 'upon_completion'],
      default: 'immediate'
    },
    creditLimit: {
      type: Number,
      default: 500
    }
  },
  stats: {
    totalPaid: {
      type: Number,
      default: 0
    },
    totalJobs: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    lastServiceDays: {
      type: Number,
      default: 0
    },
    outstandingBalance: {
      type: Number,
      default: 0
    }
  },
  notes: String,
  tags: [String],
  lastServiceDate: Date,
  nextServiceDate: Date,
  dateAdded: {
    type: Date,
    default: Date.now
  }
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