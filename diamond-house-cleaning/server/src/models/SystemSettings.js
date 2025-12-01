const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Setting key is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  value: mongoose.Schema.Types.Mixed,
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    required: [true, 'Setting type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['general', 'payment', 'notification', 'booking', 'pricing', 'security', 'maintenance']
  },
  description: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  isEditable: {
    type: Boolean,
    default: true
  },
  validation: {
    min: Number,
    max: Number,
    pattern: String,
    enum: [String],
    required: Boolean
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
systemSettingsSchema.index({ category: 1 });
systemSettingsSchema.index({ key: 1 });

// Pre-save validation
systemSettingsSchema.pre('save', function(next) {
  // Type validation
  if (this.type === 'number' && typeof this.value !== 'number') {
    return next(new Error('Value must be a number'));
  }
  if (this.type === 'boolean' && typeof this.value !== 'boolean') {
    return next(new Error('Value must be a boolean'));
  }
  if (this.type === 'string' && typeof this.value !== 'string') {
    return next(new Error('Value must be a string'));
  }

  // Range validation
  if (this.validation && this.type === 'number') {
    if (this.validation.min !== undefined && this.value < this.validation.min) {
      return next(new Error(`Value must be at least ${this.validation.min}`));
    }
    if (this.validation.max !== undefined && this.value > this.validation.max) {
      return next(new Error(`Value must be at most ${this.validation.max}`));
    }
  }

  next();
});

// Static method to get setting value
systemSettingsSchema.statics.getValue = async function(key, defaultValue = null) {
  const setting = await this.findOne({ key });
  return setting ? setting.value : defaultValue;
};

// Static method to set setting value
systemSettingsSchema.statics.setValue = async function(key, value, updatedBy = null) {
  const setting = await this.findOne({ key });
  if (!setting) {
    throw new Error(`Setting ${key} not found`);
  }

  if (!setting.isEditable) {
    throw new Error(`Setting ${key} is not editable`);
  }

  setting.value = value;
  if (updatedBy) {
    setting.updatedBy = updatedBy;
  }

  return setting.save();
};

// Static method to get settings by category
systemSettingsSchema.statics.getByCategory = function(category) {
  return this.find({ category }).sort({ key: 1 });
};

// Static method to initialize default settings
systemSettingsSchema.statics.initializeDefaults = async function() {
  const defaultSettings = [
    // General settings
    { key: 'company_name', value: 'Diamond House Cleaning', type: 'string', category: 'general', description: 'Company name displayed throughout the application' },
    { key: 'company_email', value: 'info@diamondhousecleaning.com', type: 'string', category: 'general', description: 'Primary company email address' },
    { key: 'company_phone', value: '+91-XXXXXXXXXX', type: 'string', category: 'general', description: 'Primary company phone number' },
    { key: 'timezone', value: 'Asia/Kolkata', type: 'string', category: 'general', description: 'Default timezone for the application' },

    // Booking settings
    { key: 'booking_advance_notice_hours', value: 24, type: 'number', category: 'booking', description: 'Minimum hours notice required for booking' },
    { key: 'booking_cancellation_hours', value: 2, type: 'number', category: 'booking', description: 'Hours before booking when cancellation is not allowed' },
    { key: 'booking_reschedule_hours', value: 4, type: 'number', category: 'booking', description: 'Hours before booking when rescheduling is not allowed' },

    // Pricing settings
    { key: 'gst_rate', value: 18, type: 'number', category: 'pricing', description: 'GST rate percentage' },
    { key: 'minimum_service_charge', value: 500, type: 'number', category: 'pricing', description: 'Minimum service charge in INR' },

    // Payment settings
    { key: 'payment_gateway', value: 'razorpay', type: 'string', category: 'payment', description: 'Default payment gateway' },
    { key: 'currency', value: 'INR', type: 'string', category: 'payment', description: 'Default currency' },

    // Notification settings
    { key: 'email_notifications', value: true, type: 'boolean', category: 'notification', description: 'Enable email notifications' },
    { key: 'sms_notifications', value: true, type: 'boolean', category: 'notification', description: 'Enable SMS notifications' },

    // Security settings
    { key: 'session_timeout', value: 24, type: 'number', category: 'security', description: 'Session timeout in hours' },
    { key: 'password_min_length', value: 6, type: 'number', category: 'security', description: 'Minimum password length' },

    // Maintenance settings
    { key: 'maintenance_mode', value: false, type: 'boolean', category: 'maintenance', description: 'Enable maintenance mode' }
  ];

  for (const setting of defaultSettings) {
    await this.findOneAndUpdate(
      { key: setting.key },
      setting,
      { upsert: true, new: true }
    );
  }
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);