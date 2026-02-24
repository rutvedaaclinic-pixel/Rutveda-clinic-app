const express = require('express');
const router = express.Router();
const Service = require('../models/Service');

// Authentication disabled for development
// const { protect } = require('../middleware/auth');
// router.use(protect);

// @desc    Get all services
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serviceId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Service.countDocuments(query);
    
    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: services.length,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      },
      data: services
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all services (list)
// @route   GET /api/services/all
// @access  Public
router.get('/all', async (req, res) => {
  try {
    const services = await Service.find().sort({ name: 1 });
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get service stats
// @route   GET /api/services/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const total = await Service.countDocuments();
    const result = await Service.aggregate([
      { $group: { _id: null, totalValue: { $sum: '$price' }, avgPrice: { $avg: '$price' } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        total,
        totalValue: result[0]?.totalValue || 0,
        avgPrice: Math.round(result[0]?.avgPrice || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Search services
// @route   GET /api/services/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }
    
    const services = await Service.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { serviceId: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);
    
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create service
// @route   POST /api/services
// @access  Public
router.post('/', async (req, res) => {
  try {
    // Generate service ID
    const serviceId = await Service.generateServiceId();
    
    // Create service with generated ID
    const service = await Service.create({
      ...req.body,
      serviceId
    });
    res.status(201).json({ success: true, message: 'Service created successfully', data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, message: 'Service updated successfully', data: service });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;