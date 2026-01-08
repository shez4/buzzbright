const mongoose = require('mongoose');

const staffAvailabilitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  dayOfWeek: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  availability: [{
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['available', 'busy', 'unavailable', 'preferred'],
      default: 'available'
    },
    reason: String
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringEndDate: Date,
  notes: String
}, {
  timestamps: true
});

// Compound index for user and date
staffAvailabilitySchema.index({ user: 1, date: 1 }, { unique: true });

const staffSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  department: {
    type: String,
    enum: ['cleaning', 'management', 'customer_service', 'maintenance'],
    default: 'cleaning'
  },
  position: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    enum: ['regular_cleaning', 'deep_cleaning', 'carpet_cleaning', 'window_cleaning', 'floor_maintenance', 'upholstery_cleaning', 'pressure_washing', 'team_leadership']
  }],
  certifications: [{
    name: String,
    issueDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  workSchedule: {
    standardHours: {
      monday: { start: String, end: String, isWorkingDay: Boolean },
      tuesday: { start: String, end: String, isWorkingDay: Boolean },
      wednesday: { start: String, end: String, isWorkingDay: Boolean },
      thursday: { start: String, end: String, isWorkingDay: Boolean },
      friday: { start: String, end: String, isWorkingDay: Boolean },
      saturday: { start: String, end: String, isWorkingDay: Boolean },
      sunday: { start: String, end: String, isWorkingDay: Boolean }
    },
    maxHoursPerWeek: {
      type: Number,
      default: 40
    }
  },
  employment: {
    hireDate: {
      type: Date,
      required: true
    },
    employmentType: {
      type: String,
      enum: ['full_time', 'part_time', 'contract', 'temporary'],
      default: 'full_time'
    },
    hourlyRate: {
      type: Number,
      required: true
    },
    payType: {
      type: String,
      enum: ['hourly', 'salary', 'commission'],
      default: 'hourly'
    }
  },
  performance: {
    totalJobsCompleted: {
      type: Number,
      default: 0
    },
    totalHoursWorked: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    lastReviewDate: Date,
    nextReviewDate: Date
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on_leave', 'terminated'],
    default: 'active'
  },
  notes: String
}, {
  timestamps: true
});

// Generate employee ID before saving
staffSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({});
    this.employeeId = `EMP${year}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

const Staff = mongoose.model('Staff', staffSchema);
const StaffAvailability = mongoose.model('StaffAvailability', staffAvailabilitySchema);

module.exports = { Staff, StaffAvailability };