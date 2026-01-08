const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  date: {
    type: Date,
    required: true
  },
  clockIn: {
    time: {
      type: Date,
      required: true
    },
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    photo: String, // URL to clock-in photo
    method: {
      type: String,
      enum: ['mobile', 'web', 'manual'],
      default: 'mobile'
    }
  },
  clockOut: {
    time: Date,
    location: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    photo: String, // URL to clock-out photo
    method: {
      type: String,
      enum: ['mobile', 'web', 'manual'],
      default: 'mobile'
    }
  },
  breaks: [{
    startTime: {
      type: Date,
      required: true
    },
    endTime: Date,
    type: {
      type: String,
      enum: ['lunch', 'break', 'other'],
      default: 'break'
    },
    duration: Number, // in minutes
    paid: {
      type: Boolean,
      default: false
    }
  }],
  totalHours: {
    type: Number,
    default: 0
  },
  regularHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  breakHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'needs_review'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  notes: String,
  adminNotes: String,
  expenses: [{
    description: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      enum: ['fuel', 'supplies', 'parking', 'meals', 'other'],
      required: true
    },
    receipt: String, // URL to receipt image
    approved: {
      type: Boolean,
      default: false
    }
  }],
  mileage: {
    startReading: Number,
    endReading: Number,
    totalMiles: Number,
    rate: {
      type: Number,
      default: 0.67 // Current IRS rate
    }
  },
  payrollPeriod: {
    startDate: Date,
    endDate: Date
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }]
}, {
  timestamps: true
});

// Calculate total hours before saving
timesheetSchema.pre('save', function(next) {
  if (this.clockIn.time && this.clockOut.time) {
    const clockInTime = new Date(this.clockIn.time);
    const clockOutTime = new Date(this.clockOut.time);
    
    // Calculate total break time
    let totalBreakTime = 0;
    this.breaks.forEach(breakItem => {
      if (breakItem.endTime) {
        const breakDuration = (new Date(breakItem.endTime) - new Date(breakItem.startTime)) / (1000 * 60 * 60); // in hours
        breakItem.duration = breakDuration * 60; // store in minutes
        if (!breakItem.paid) {
          totalBreakTime += breakDuration;
        }
      }
    });
    
    this.breakHours = totalBreakTime;
    
    // Calculate total work hours (excluding unpaid breaks)
    const totalWorkTime = (clockOutTime - clockInTime) / (1000 * 60 * 60); // in hours
    this.totalHours = Math.max(0, totalWorkTime - totalBreakTime);
    
    // Calculate regular and overtime hours
    if (this.totalHours <= 8) {
      this.regularHours = this.totalHours;
      this.overtimeHours = 0;
    } else {
      this.regularHours = 8;
      this.overtimeHours = this.totalHours - 8;
    }
  }
  
  next();
});

// Compound index for staff and date
timesheetSchema.index({ staff: 1, date: 1 });

module.exports = mongoose.model('Timesheet', timesheetSchema);