const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');

// Authentication disabled for development
// const { protect } = require('../middleware/auth');
// router.use(protect);

// @desc    Get all bills
// @route   GET /api/bills
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, paymentStatus, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { billId: { $regex: search, $options: 'i' } },
        { patientName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Bill.countDocuments(query);
    
    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: bills.length,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total
      },
      data: bills
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get today's bills
// @route   GET /api/bills/today
// @access  Public
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bills = await Bill.find({ createdAt: { $gte: today } }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bills.length, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get bill stats
// @route   GET /api/bills/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const total = await Bill.countDocuments();
    const result = await Bill.aggregate([
      { $group: { _id: null, totalAmount: { $sum: '$totalAmount' }, avgAmount: { $avg: '$totalAmount' } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        total,
        totalAmount: result[0]?.totalAmount || 0,
        avgAmount: Math.round(result[0]?.avgAmount || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get bills by patient
// @route   GET /api/bills/patient/:patientId
// @access  Public
router.get('/patient/:patientId', async (req, res) => {
  try {
    const bills = await Bill.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bills.length, data: bills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single bill
// @route   GET /api/bills/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, data: bill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create bill
// @route   POST /api/bills
// @access  Public
router.post('/', async (req, res) => {
  try {
    // Generate bill ID
    const billId = await Bill.generateBillId();
    
    // Create bill with generated ID
    const bill = await Bill.create({
      ...req.body,
      billId
    });
    res.status(201).json({ success: true, message: 'Bill created successfully', data: bill });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Update bill
// @route   PUT /api/bills/:id
// @access  Public
router.put('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, message: 'Bill updated successfully', data: bill });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @desc    Delete bill
// @route   DELETE /api/bills/:id
// @access  Public
router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findByIdAndDelete(req.params.id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found' });
    }
    res.status(200).json({ success: true, message: 'Bill deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;