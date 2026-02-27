const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
const Service = require('../models/Service');
const { successResponse, errorResponse, paginatedResponse, notFoundResponse } = require('../utils/response');
const { isValidDate, safeDate } = require('../utils/dateUtils');

/**
 * Validate MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} True if valid, false otherwise
 */
const isValidObjectId = (id) => {
  return id && mongoose.Types.ObjectId.isValid(id);
};

/**
 * Safe date filter builder
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {object|null} Date filter object or null
 */
const buildDateFilter = (startDate, endDate) => {
  const dateFilter = {};
  
  if (startDate) {
    const start = safeDate(startDate);
    if (start) {
      dateFilter.$gte = start;
    }
  }
  
  if (endDate) {
    const end = safeDate(endDate);
    if (end) {
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }
  }
  
  return Object.keys(dateFilter).length > 0 ? dateFilter : null;
};

// @desc    Get all bills
// @route   GET /api/bills
// @access  Private
exports.getBills = async (req, res, next) => {
  try {
    const { search, startDate, endDate, paymentStatus, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { billId: { $regex: search, $options: 'i' } },
        { patientName: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter - safely handle dates
    const dateFilter = buildDateFilter(startDate, endDate);
    if (dateFilter) {
      query.createdAt = dateFilter;
    }

    // Payment status filter
    if (paymentStatus && ['paid', 'pending', 'partial'].includes(paymentStatus)) {
      query.paymentStatus = paymentStatus;
    }

    // Count total documents
    const total = await Bill.countDocuments(query);

    // Get bills with pagination
    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('patient', 'patientId name phone')
      .populate('createdBy', 'name email');

    return paginatedResponse(res, bills, parseInt(page), parseInt(limit), total, 'Bills retrieved successfully');
  } catch (error) {
    console.error('Error in getBills:', error.message);
    return errorResponse(res, 'Failed to retrieve bills', 500);
  }
};

// @desc    Get single bill
// @route   GET /api/bills/:id
// @access  Private
exports.getBill = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid bill ID format', 400);
    }

    const bill = await Bill.findById(id)
      .populate('patient', 'patientId name phone age gender')
      .populate('medicines.medicine', 'medicineId name')
      .populate('services.service', 'serviceId name')
      .populate('createdBy', 'name email');

    if (!bill) {
      return notFoundResponse(res, 'Bill not found');
    }

    return successResponse(res, bill, 'Bill retrieved successfully');
  } catch (error) {
    console.error('Error in getBill:', error.message);
    
    // Handle CastError (invalid ObjectId that passed validation)
    if (error.name === 'CastError') {
      return errorResponse(res, 'Invalid bill ID format', 400);
    }
    
    return errorResponse(res, 'Failed to retrieve bill', 500);
  }
};

// @desc    Create new bill
// @route   POST /api/bills
// @access  Private
exports.createBill = async (req, res, next) => {
  try {
    const { patient, consultationFee, medicines, services, paymentStatus, paymentMethod, notes } = req.body;

    // Verify patient exists
    const patientDoc = await Patient.findById(patient);
    if (!patientDoc) {
      return errorResponse(res, 'Patient not found', 404);
    }

    // Process medicines - calculate totals and update stock
    const processedMedicines = [];
    if (medicines && medicines.length > 0) {
      for (const item of medicines) {
        const medicine = await Medicine.findById(item.medicine || item.id);
        if (!medicine) {
          return errorResponse(res, `Medicine not found: ${item.name || item.id}`, 404);
        }

        // Check stock
        if (medicine.stock < item.quantity) {
          return errorResponse(res, `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}`, 400);
        }

        processedMedicines.push({
          medicine: medicine._id,
          name: medicine.name,
          price: medicine.sellingPrice,
          quantity: item.quantity,
          total: medicine.sellingPrice * item.quantity
        });

        // Update stock
        medicine.stock -= item.quantity;
        await medicine.save();
      }
    }

    // Process services
    const processedServices = [];
    if (services && services.length > 0) {
      for (const item of services) {
        const service = await Service.findById(item.service || item.id);
        if (!service) {
          return errorResponse(res, `Service not found: ${item.name || item.id}`, 404);
        }

        processedServices.push({
          service: service._id,
          name: service.name,
          price: service.price
        });
      }
    }

    // Generate bill ID
    const billId = await Bill.generateBillId();

    // Create bill
    const bill = await Bill.create({
      billId,
      patient,
      patientName: patientDoc.name,
      patientPhone: patientDoc.phone,
      consultationFee: consultationFee || 500,
      medicines: processedMedicines,
      services: processedServices,
      paymentStatus: paymentStatus || 'paid',
      paymentMethod: paymentMethod || 'cash',
      notes,
      createdBy: req.user?._id || null
    });

    // Update patient's last visit
    patientDoc.lastVisit = new Date();
    await patientDoc.save();

    // Return populated bill
    const populatedBill = await Bill.findById(bill._id)
      .populate('patient', 'patientId name phone')
      .populate('createdBy', 'name email');

    return successResponse(res, populatedBill, 'Bill created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update bill
// @route   PUT /api/bills/:id
// @access  Private
exports.updateBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentMethod, notes } = req.body;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid bill ID format', 400);
    }

    const bill = await Bill.findById(id);

    if (!bill) {
      return notFoundResponse(res, 'Bill not found');
    }

    // Only allow updating payment-related fields
    if (paymentStatus) bill.paymentStatus = paymentStatus;
    if (paymentMethod) bill.paymentMethod = paymentMethod;
    if (notes !== undefined) bill.notes = notes;

    await bill.save();

    const updatedBill = await Bill.findById(bill._id)
      .populate('patient', 'patientId name phone')
      .populate('createdBy', 'name email');

    return successResponse(res, updatedBill, 'Bill updated successfully');
  } catch (error) {
    console.error('Error in updateBill:', error.message);
    
    if (error.name === 'CastError') {
      return errorResponse(res, 'Invalid bill ID format', 400);
    }
    
    return errorResponse(res, 'Failed to update bill', 500);
  }
};

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Private (Admin only)
exports.deleteBill = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(id)) {
      return errorResponse(res, 'Invalid bill ID format', 400);
    }

    const bill = await Bill.findById(id);

    if (!bill) {
      return notFoundResponse(res, 'Bill not found');
    }

    // Restore medicine stock
    for (const item of bill.medicines) {
      if (isValidObjectId(item.medicine)) {
        const medicine = await Medicine.findById(item.medicine);
        if (medicine) {
          medicine.stock += item.quantity;
          await medicine.save();
        }
      }
    }

    await bill.deleteOne();

    return successResponse(res, null, 'Bill deleted successfully');
  } catch (error) {
    console.error('Error in deleteBill:', error.message);
    
    if (error.name === 'CastError') {
      return errorResponse(res, 'Invalid bill ID format', 400);
    }
    
    return errorResponse(res, 'Failed to delete bill', 500);
  }
};

// @desc    Get today's bills
// @route   GET /api/bills/today
// @access  Private
exports.getTodayBills = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const bills = await Bill.find({
      createdAt: { $gte: today, $lt: tomorrow }
    })
      .sort({ createdAt: -1 })
      .populate('patient', 'patientId name phone');

    const totalEarnings = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    return successResponse(res, {
      bills,
      count: bills.length,
      totalEarnings
    }, 'Today\'s bills retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get bill statistics
// @route   GET /api/bills/stats
// @access  Private
exports.getBillStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's stats
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayBills = await Bill.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayEarnings = todayBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    // This month's stats
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthBills = await Bill.find({
      createdAt: { $gte: firstDayOfMonth }
    });

    const monthEarnings = monthBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    // Total stats
    const totalBills = await Bill.countDocuments();
    const totalEarningsResult = await Bill.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);
    const totalEarnings = totalEarningsResult[0]?.total || 0;

    // Payment status breakdown
    const paidBills = await Bill.countDocuments({ paymentStatus: 'paid' });
    const pendingBills = await Bill.countDocuments({ paymentStatus: 'pending' });
    const partialBills = await Bill.countDocuments({ paymentStatus: 'partial' });

    return successResponse(res, {
      today: {
        count: todayBills.length,
        earnings: todayEarnings
      },
      thisMonth: {
        count: monthBills.length,
        earnings: monthEarnings
      },
      total: {
        count: totalBills,
        earnings: totalEarnings
      },
      paymentStatus: {
        paid: paidBills,
        pending: pendingBills,
        partial: partialBills
      }
    }, 'Bill statistics retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get bills by patient
// @route   GET /api/bills/patient/:patientId
// @access  Private
exports.getBillsByPatient = async (req, res, next) => {
  try {
    const bills = await Bill.find({ patient: req.params.patientId })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    return successResponse(res, bills, 'Patient bills retrieved successfully');
  } catch (error) {
    next(error);
  }
};