const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  quoteNumber: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['regular_cleaning', 'deep_cleaning', 'move_in', 'move_out', 'post_construction', 'carpet_cleaning', 'window_cleaning', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'converted'],
    default: 'draft'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  property: {
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
      }
    },
    propertyType: {
      type: String,
      enum: ['residential', 'commercial', 'office', 'retail'],
      default: 'residential'
    },
    squareFootage: Number,
    bedrooms: Number,
    bathrooms: Number,
    floors: Number,
    accessInstructions: String,
    specialConditions: String
  },
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ['cleaning', 'maintenance', 'supplies', 'equipment']
    },
    quantity: {
      type: Number,
      default: 1
    },
    unitPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    frequency: {
      type: String,
      enum: ['one-time', 'weekly', 'biweekly', 'monthly', 'custom']
    },
    estimatedDuration: Number, // in minutes
    notes: String
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    discount: {
      amount: {
        type: Number,
        default: 0
      },
      percentage: {
        type: Number,
        default: 0
      },
      reason: String
    },
    total: {
      type: Number,
      required: true
    }
  },
  schedule: {
    preferredStartDate: Date,
    estimatedDuration: Number, // in hours
    frequency: {
      type: String,
      enum: ['one-time', 'weekly', 'biweekly', 'monthly', 'custom']
    },
    preferredDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    preferredTime: {
      type: String,
      enum: ['morning', 'afternoon', 'evening', 'flexible']
    }
  },
  terms: {
    validUntil: {
      type: Date,
      required: true
    },
    paymentTerms: {
      type: String,
      enum: ['immediate', 'net_15', 'net_30', 'upon_completion'],
      default: 'upon_completion'
    },
    cancellationPolicy: String,
    specialTerms: String
  },
  communication: {
    sentDate: Date,
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentMethod: {
      type: String,
      enum: ['email', 'sms', 'in_person', 'phone']
    },
    viewedDate: Date,
    responses: [{
      date: Date,
      message: String,
      respondedBy: String, // client name or email
      type: {
        type: String,
        enum: ['question', 'modification_request', 'acceptance', 'rejection']
      }
    }]
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  convertedToJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  notes: String,
  internalNotes: String,
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    data: mongoose.Schema.Types.Mixed,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: Date,
    reason: String
  }]
}, {
  timestamps: true
});

// Generate quote number before saving
quoteSchema.pre('save', async function(next) {
  if (!this.quoteNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const prefix = `QUO${year}${month}${day}`;
    const count = await this.constructor.countDocuments({
      quoteNumber: { $regex: `^${prefix}` }
    });
    
    this.quoteNumber = `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }
  
  // Set expiry date if not set (default 30 days from creation)
  if (!this.terms.validUntil) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.terms.validUntil = expiryDate;
  }
  
  next();
});

// Calculate totals before saving
quoteSchema.pre('save', function(next) {
  // Calculate subtotal
  this.pricing.subtotal = this.services.reduce((sum, service) => {
    return sum + (service.totalPrice || (service.quantity * service.unitPrice));
  }, 0);
  
  // Calculate discount amount
  if (this.pricing.discount.percentage > 0) {
    this.pricing.discount.amount = (this.pricing.subtotal * this.pricing.discount.percentage) / 100;
  }
  
  const afterDiscount = this.pricing.subtotal - this.pricing.discount.amount;
  
  // Calculate total
  this.pricing.total = afterDiscount;
  
  next();
});

module.exports = mongoose.model('Quote', quoteSchema);