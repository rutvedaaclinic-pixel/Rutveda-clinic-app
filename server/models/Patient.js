const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number']
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
    max: [120, 'Age cannot exceed 120']
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: ['Male', 'Female', 'Other']
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  address: {
    type: String,
    trim: true,
    maxlength: [500, 'Address cannot exceed 500 characters']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']
  },
  medicalHistory: {
    type: String,
    trim: true,
    maxlength: [2000, 'Medical history cannot exceed 2000 characters']
  },
  visits: [{
    date: {
      type: Date,
      default: Date.now
    },
    diagnosis: {
      type: String,
      trim: true,
      maxlength: [500, 'Diagnosis cannot exceed 500 characters']
    },
    prescription: {
      type: String,
      trim: true,
      maxlength: [1000, 'Prescription cannot exceed 1000 characters']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    doctorName: {
      type: String,
      trim: true
    }
  }],
  lastVisit: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries
patientSchema.index({ patientId: 1 });
patientSchema.index({ phone: 1 });
patientSchema.index({ name: 'text' });
patientSchema.index({ lastVisit: -1 });
patientSchema.index({ status: 1 });

// Static method to generate patient ID
patientSchema.statics.generatePatientId = async function() {
  const lastPatient = await this.findOne({}, {}, { sort: { 'patientId': -1 } });
  
  if (!lastPatient || !lastPatient.patientId) {
    return 'DOC001';
  }
  
  const lastId = parseInt(lastPatient.patientId.replace('DOC', ''));
  const newId = `DOC${String(lastId + 1).padStart(3, '0')}`;
  return newId;
};

// Method to check if patient visited today
patientSchema.methods.visitedToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastVisit = new Date(this.lastVisit);
  lastVisit.setHours(0, 0, 0, 0);
  return today.getTime() === lastVisit.getTime();
};

// Virtual for formatted last visit date
patientSchema.virtual('formattedLastVisit').get(function() {
  return new Date(this.lastVisit).toISOString().split('T')[0];
});

// Ensure virtuals are included in JSON output
patientSchema.set('toJSON', { virtuals: true });
patientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Patient', patientSchema);