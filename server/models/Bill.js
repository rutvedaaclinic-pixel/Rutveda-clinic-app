const mongoose = require('mongoose');

// Medicine item schema for bill
const medicineItemSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine'
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

// Service item schema for bill
const serviceItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const billSchema = new mongoose.Schema({
  billId: {
    type: String,
    unique: true,
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient is required']
  },
  patientName: {
    type: String,
    required: [true, 'Patient name is required']
  },
  patientPhone: {
    type: String
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    default: 500,
    min: [0, 'Consultation fee cannot be negative']
  },
  medicines: [medicineItemSchema],
  services: [serviceItemSchema],
  medicinesTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  servicesTotal: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'partial'],
    default: 'paid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', ''],
    default: 'cash'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  }
}, {
  timestamps: true
});

// Indexes for faster queries (billId already indexed by unique: true)
billSchema.index({ patient: 1 });
billSchema.index({ createdAt: -1 });
billSchema.index({ paymentStatus: 1 });

// Static method to generate bill ID
billSchema.statics.generateBillId = async function() {
  const lastBill = await this.findOne({}, {}, { sort: { 'billId': -1 } });
  
  if (!lastBill || !lastBill.billId) {
    return 'BILL001';
  }
  
  const lastId = parseInt(lastBill.billId.replace('BILL', ''));
  const newId = `BILL${String(lastId + 1).padStart(3, '0')}`;
  return newId;
};

// Pre-save middleware to calculate totals
billSchema.pre('save', function(next) {
  // Calculate medicines total
  this.medicinesTotal = this.medicines.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate services total
  this.servicesTotal = this.services.reduce((sum, item) => sum + item.price, 0);
  
  // Calculate total amount
  this.totalAmount = this.consultationFee + this.medicinesTotal + this.servicesTotal;
  
  next();
});

// Method to get bill summary
billSchema.methods.getSummary = function() {
  return {
    billId: this.billId,
    patientName: this.patientName,
    totalAmount: this.totalAmount,
    paymentStatus: this.paymentStatus,
    date: this.createdAt || null
  };
};

module.exports = mongoose.model('Bill', billSchema);