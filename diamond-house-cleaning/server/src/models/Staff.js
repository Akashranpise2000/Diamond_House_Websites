const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  employeeId: {
    type: String,
    unique: true,
    required: [true, 'Employee ID is required']
  },
  department: {
    type: String,
    enum: ['cleaning', 'management', 'administration', 'customer_service', 'maintenance'],
    required: [true, 'Department is required']
  },
  position: {
    type: String,
    required: [true, 'Position is required'],
    enum: ['cleaner', 'supervisor', 'manager', 'administrator', 'technician', 'driver']
  },
  skills: [{
    type: String,
    enum: ['residential_cleaning', 'commercial_cleaning', 'deep_cleaning', 'carpet_cleaning', 'window_cleaning', 'floor_maintenance', 'equipment_operation', 'customer_service']
  }],
  experience: {
    years: {
      type: Number,
      min: [0, 'Experience cannot be negative']
    },
    description: String
  },
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    expiryDate: Date,
    certificateUrl: String
  }],
  availability: {
    schedule: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String, // HH:MM format
      endTime: String,   // HH:MM format
      isAvailable: {
        type: Boolean,
        default: true
      }
    }],
    timeOff: [{
      startDate: Date,
      endDate: Date,
      reason: String,
      approved: {
        type: Boolean,
        default: false
      }
    }]
  },
  performance: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    completedJobs: {
      type: Number,
      default: 0
    },
    customerSatisfaction: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    reviews: [{
      bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
      },
      rating: Number,
      comment: String,
      givenAt: Date
    }]
  },
  employment: {
    hireDate: {
      type: Date,
      required: [true, 'Hire date is required']
    },
    salary: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      payPeriod: {
        type: String,
        enum: ['hourly', 'daily', 'weekly', 'monthly'],
        default: 'monthly'
      }
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'terminated', 'on_leave'],
      default: 'active'
    },
    terminationDate: Date,
    terminationReason: String
  },
  contact: {
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'India'
      }
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['id_proof', 'address_proof', 'certification', 'contract', 'photo']
    },
    name: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
staffSchema.index({ userId: 1 });
staffSchema.index({ department: 1, position: 1 });
staffSchema.index({ 'employment.status': 1 });
staffSchema.index({ skills: 1 });

// Virtual for full name (from user)
staffSchema.virtual('fullName').get(async function() {
  const user = await mongoose.model('User').findById(this.userId);
  return user ? `${user.firstName} ${user.lastName}` : '';
});

// Virtual for years of service
staffSchema.virtual('yearsOfService').get(function() {
  if (!this.employment.hireDate) return 0;
  const now = new Date();
  const hireDate = new Date(this.employment.hireDate);
  return Math.floor((now - hireDate) / (365.25 * 24 * 60 * 60 * 1000));
});

// Instance method to check availability
staffSchema.methods.isAvailable = function(date, timeSlot) {
  // Implementation for checking availability
  // This would check the schedule and timeOff
  return true; // Placeholder
};

// Static method to get available staff
staffSchema.statics.getAvailableStaff = function(date, timeSlot, skills = []) {
  // Implementation to find available staff with required skills
  return this.find({
    'employment.status': 'active',
    skills: { $in: skills }
  }).populate('userId', 'firstName lastName phone');
};

module.exports = mongoose.model('Staff', staffSchema);