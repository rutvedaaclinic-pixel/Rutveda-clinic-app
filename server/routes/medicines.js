const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// Authentication disabled for development
// const { protect } = require('../middleware/auth');
// router.use(protect);

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, filter, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { medicineId: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (filter === 'low-stock') {
      query.stock = { $lte: 10 };
    } else if (filter === 'in-stock') {
      query.stock = { $gt: 10 };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Medicine.countDocuments(query);
    
    const medicines = await Medicine.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: medicines.length,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      },
      data: medicines
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get low stock medicines
// @route   GET /api/medicines/low-stock
// @access  Public
router.get('/low-stock', async (req, res) => {
  try {
    const medicines = await Medicine.find({ stock: { $lte: 10 } }).sort({ stock: 1 });
    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get expiring medicines
// @route   GET /api/medicines/expiring
// @access  Public
router.get('/expiring', async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const medicines = await Medicine.find({ expiryDate: { $lte: thirtyDaysFromNow } }).sort({ expiryDate: 1 });
    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get medicine stats
// @route   GET /api/medicines/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const total = await Medicine.countDocuments();
    const inStock = await Medicine.countDocuments({ stock: { $gt: 10 } });
    const lowStock = await Medicine.countDocuments({ stock: { $lte: 10, $gt: 0 } });
    const outOfStock = await Medicine.countDocuments({ stock: 0 });
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringSoon = await Medicine.countDocuments({ expiryDate: { $lte: thirtyDaysFromNow } });
    
    res.status(200).json({
      success: true,
      data: { total, inStock, lowStock, outOfStock, expiringSoon }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Search medicines
// @route   GET /api/medicines/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Please provide a search query' });
    }
    
    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { medicineId: { $regex: q, $options: 'i' } }
      ]
    }).limit(10);
    
    res.status(200).json({ success: true, count: medicines.length, data: medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.status(200).json({ success: true, data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create medicine
// @route   POST /api/medicines
// @access  Public
router.post('/', async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json({ success: true, message: 'Medicine created successfully', data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.status(200).json({ success: true, message: 'Medicine updated successfully', data: medicine });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    res.status(200).json({ success: true, message: 'Medicine deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update stock
// @route   PUT /api/medicines/:id/stock
// @access  Public
router.put('/:id/stock', async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }
    
    if (operation === 'add') {
      medicine.stock += quantity;
    } else if (operation === 'subtract') {
      medicine.stock -= quantity;
    }
    
    await medicine.save();
    res.status(200).json({ success: true, message: 'Stock updated successfully', data: medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;