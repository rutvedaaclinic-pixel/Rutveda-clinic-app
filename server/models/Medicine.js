const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  medicineId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  buyingPrice: {
    type: Number,
    required: [true, 'Buying price is required'],
    min: [0, 'Buying price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    default: 0,
    min: [0, 'Stock cannot be negative']
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  manufacturer: {
    type: String,
    trim: true,
    maxlength: [100, 'Manufacturer name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    enum: ['tablets', 'capsules', 'syrup', 'injection', 'cream', 'drops', 'other', ''],
    default: 'other'
  },
  image: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['in-stock', 'low-stock', 'expiring-soon', 'out-of-stock'],
    default: 'in-stock'
  },
  minStockLevel: {
    type: Number,
    default: 10,
    min: [0, 'Minimum stock level cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries (medicineId already indexed by unique: true)
medicineSchema.index({ name: 'text' });
medicineSchema.index({ status: 1 });
medicineSchema.index({ expiryDate: 1 });

// Static method to generate medicine ID
medicineSchema.statics.generateMedicineId = async function() {
  const lastMedicine = await this.findOne({}, {}, { sort: { 'medicineId': -1 } });
  
  if (!lastMedicine || !lastMedicine.medicineId) {
    return 'MED001';
  }
  
  const lastId = parseInt(lastMedicine.medicineId.replace('MED', ''));
  const newId = `MED${String(lastId + 1).padStart(3, '0')}`;
  return newId;
};

// Pre-save middleware to calculate status
medicineSchema.pre('save', function(next) {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  if (this.stock === 0) {
    this.status = 'out-of-stock';
  } else if (this.expiryDate <= thirtyDaysFromNow) {
    this.status = 'expiring-soon';
  } else if (this.stock <= this.minStockLevel) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  
  next();
});

// Virtual for profit margin
medicineSchema.virtual('profitMargin').get(function() {
  if (this.buyingPrice === 0) return 0;
  return ((this.sellingPrice - this.buyingPrice) / this.buyingPrice * 100).toFixed(2);
});

// Virtual for profit per unit
medicineSchema.virtual('profitPerUnit').get(function() {
  return this.sellingPrice - this.buyingPrice;
});

// Method to check if medicine is expiring within days
medicineSchema.methods.isExpiringWithin = function(days) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);
  return this.expiryDate <= targetDate;
};

module.exports = mongoose.model('Medicine', medicineSchema);