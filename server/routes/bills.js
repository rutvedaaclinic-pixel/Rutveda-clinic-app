const express = require('express');
const router = express.Router();

// Import controller
const billController = require('../controllers/billController');

// Authentication disabled for development
// const { protect } = require('../middleware/auth');
// router.use(protect);

// @desc    Get bill statistics
// @route   GET /api/bills/stats
// @access  Public
router.get('/stats', billController.getBillStats);

// @desc    Get today's bills
// @route   GET /api/bills/today
// @access  Public
router.get('/today', billController.getTodayBills);

// @desc    Get bills by patient
// @route   GET /api/bills/patient/:patientId
// @access  Public
router.get('/patient/:patientId', billController.getBillsByPatient);

// @desc    Get all bills
// @route   GET /api/bills
// @access  Public
router.get('/', billController.getBills);

// @desc    Get single bill
// @route   GET /api/bills/:id
// @access  Public
router.get('/:id', billController.getBill);

// @desc    Create bill (with stock deduction)
// @route   POST /api/bills
// @access  Public
router.post('/', billController.createBill);

// @desc    Update bill
// @route   PUT /api/bills/:id
// @access  Public
router.put('/:id', billController.updateBill);

// @desc    Delete bill (restores stock)
// @route   DELETE /api/bills/:id
// @access  Public
router.delete('/:id', billController.deleteBill);

module.exports = router;
