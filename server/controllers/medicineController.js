const Medicine = require('../models/Medicine');
const { successResponse, errorResponse, paginatedResponse, notFoundResponse } = require('../utils/response');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
exports.getMedicines = async (req, res, next) => {
  try {
    const { search, filter, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { medicineId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter functionality
    if (filter && ['in-stock', 'low-stock', 'expiring-soon', 'out-of-stock'].includes(filter)) {
      query.status = filter;
    }

    // Count total documents
    const total = await Medicine.countDocuments(query);

    // Get medicines with pagination
    const medicines = await Medicine.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    return paginatedResponse(res, medicines, parseInt(page), parseInt(limit), total, 'Medicines retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock medicines
// @route   GET /api/medicines/low-stock
// @access  Private
exports.getLowStockMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({
      status: { $in: ['low-stock', 'out-of-stock'] }
    }).sort({ stock: 1 });

    return successResponse(res, medicines, 'Low stock medicines retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get expiring medicines
// @route   GET /api/medicines/expiring
// @access  Private
exports.getExpiringMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({
      status: 'expiring-soon'
    }).sort({ expiryDate: 1 });

    return successResponse(res, medicines, 'Expiring medicines retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Private
exports.getMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('createdBy', 'name email');

    if (!medicine) {
      return notFoundResponse(res, 'Medicine not found');
    }

    return successResponse(res, medicine, 'Medicine retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private
exports.createMedicine = async (req, res, next) => {
  try {
    // Generate medicine ID
    const medicineId = await Medicine.generateMedicineId();

    // Create medicine
    const medicine = await Medicine.create({
      ...req.body,
      medicineId,
      createdBy: req.user._id
    });

    return successResponse(res, medicine, 'Medicine created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private
exports.updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return notFoundResponse(res, 'Medicine not found');
    }

    // Update medicine
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return successResponse(res, updatedMedicine, 'Medicine updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private
exports.deleteMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return notFoundResponse(res, 'Medicine not found');
    }

    await medicine.deleteOne();

    return successResponse(res, null, 'Medicine deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update medicine stock
// @route   PUT /api/medicines/:id/stock
// @access  Private
exports.updateStock = async (req, res, next) => {
  try {
    const { quantity, operation = 'set' } = req.body;
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return notFoundResponse(res, 'Medicine not found');
    }

    if (operation === 'add') {
      medicine.stock += quantity;
    } else if (operation === 'subtract') {
      medicine.stock = Math.max(0, medicine.stock - quantity);
    } else {
      medicine.stock = quantity;
    }

    await medicine.save();

    return successResponse(res, medicine, 'Stock updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get medicine statistics
// @route   GET /api/medicines/stats
// @access  Private
exports.getMedicineStats = async (req, res, next) => {
  try {
    const totalMedicines = await Medicine.countDocuments();
    const inStock = await Medicine.countDocuments({ status: 'in-stock' });
    const lowStock = await Medicine.countDocuments({ status: 'low-stock' });
    const outOfStock = await Medicine.countDocuments({ status: 'out-of-stock' });
    const expiringSoon = await Medicine.countDocuments({ status: 'expiring-soon' });

    // Calculate total inventory value
    const inventoryValue = await Medicine.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$sellingPrice', '$stock'] } },
          totalStock: { $sum: '$stock' }
        }
      }
    ]);

    return successResponse(res, {
      total: totalMedicines,
      inStock,
      lowStock,
      outOfStock,
      expiringSoon,
      inventoryValue: inventoryValue[0]?.totalValue || 0,
      totalStock: inventoryValue[0]?.totalStock || 0
    }, 'Medicine statistics retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Search medicines
// @route   GET /api/medicines/search
// @access  Private
exports.searchMedicines = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return successResponse(res, [], 'Search query is required');
    }

    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { medicineId: { $regex: q, $options: 'i' } }
      ],
      status: { $ne: 'out-of-stock' }
    })
      .limit(10)
      .select('medicineId name sellingPrice stock status expiryDate');

    return successResponse(res, medicines, 'Search results');
  } catch (error) {
    next(error);
  }
};