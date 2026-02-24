const Service = require('../models/Service');
const { successResponse, errorResponse, paginatedResponse, notFoundResponse } = require('../utils/response');

// @desc    Get all services
// @route   GET /api/services
// @access  Private
exports.getServices = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    // Build query
    let query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serviceId: { $regex: search, $options: 'i' } }
      ];
    }

    // Count total documents
    const total = await Service.countDocuments(query);

    // Get services with pagination
    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    return paginatedResponse(res, services, parseInt(page), parseInt(limit), total, 'Services retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get all services (no pagination - for dropdowns)
// @route   GET /api/services/all
// @access  Private
exports.getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true })
      .sort({ name: 1 })
      .select('serviceId name price duration');

    return successResponse(res, services, 'Services retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Private
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('createdBy', 'name email');

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    return successResponse(res, service, 'Service retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private
exports.createService = async (req, res, next) => {
  try {
    // Generate service ID
    const serviceId = await Service.generateServiceId();

    // Create service
    const service = await Service.create({
      ...req.body,
      serviceId,
      createdBy: req.user._id
    });

    return successResponse(res, service, 'Service created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    // Update service
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return successResponse(res, updatedService, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service (soft delete)
// @route   DELETE /api/services/:id
// @access  Private
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return notFoundResponse(res, 'Service not found');
    }

    // Soft delete by setting isActive to false
    service.isActive = false;
    await service.save();

    return successResponse(res, null, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get service statistics
// @route   GET /api/services/stats
// @access  Private
exports.getServiceStats = async (req, res, next) => {
  try {
    const totalServices = await Service.countDocuments({ isActive: true });
    
    // Calculate total value
    const result = await Service.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$price' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    const stats = result[0] || { totalValue: 0, avgPrice: 0, minPrice: 0, maxPrice: 0 };

    return successResponse(res, {
      total: totalServices,
      totalValue: stats.totalValue,
      averagePrice: Math.round(stats.avgPrice),
      minPrice: stats.minPrice,
      maxPrice: stats.maxPrice
    }, 'Service statistics retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Search services
// @route   GET /api/services/search
// @access  Private
exports.searchServices = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return successResponse(res, [], 'Search query is required');
    }

    const services = await Service.find({
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { serviceId: { $regex: q, $options: 'i' } }
      ]
    })
      .limit(10)
      .select('serviceId name price duration');

    return successResponse(res, services, 'Search results');
  } catch (error) {
    next(error);
  }
};