const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: String,
    trim: true,
    maxlength: [50, 'Duration cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
serviceSchema.index({ serviceId: 1 });
serviceSchema.index({ name: 'text' });
serviceSchema.index({ isActive: 1 });

// Static method to generate service ID
serviceSchema.statics.generateServiceId = async function() {
  const lastService = await this.findOne({}, {}, { sort: { 'serviceId': -1 } });
  
  if (!lastService || !lastService.serviceId) {
    return 'SER001';
  }
  
  const lastId = parseInt(lastService.serviceId.replace('SER', ''));
  const newId = `SER${String(lastId + 1).padStart(3, '0')}`;
  return newId;
};

// Ensure virtuals are included in JSON output
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Service', serviceSchema);