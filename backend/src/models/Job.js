const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobNumber: {
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
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'postponed'],
    default: 'scheduled'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: true
  },
  actualDuration: {
    type: Number // in minutes
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
    accessInstructions: String,
    keyLocation: String
  },
  assignedStaff: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['lead', 'assistant'],
      default: 'assistant'
    }
  }],
  services: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    }
  }],
  supplies: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem'
    },
    quantity: {
      type: Number,
      required: true
    },
    used: {
      type: Number,
      default: 0
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  completion: {
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    photos: [String], // URLs to completion photos
    clientSignature: String, // URL to signature image
    notes: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['weekly', 'biweekly', 'monthly', 'custom']
    },
    nextScheduledDate: Date,
    endDate: Date
  },
  notes: String,
  internalNotes: String
}, {
  timestamps: true
});

// Generate job number before saving
jobSchema.pre('save', async function(next) {
  if (!this.jobNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const prefix = `JOB${year}${month}${day}`;
    const count = await this.constructor.countDocuments({
      jobNumber: { $regex: `^${prefix}` }
    });
    
    this.jobNumber = `${prefix}-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);