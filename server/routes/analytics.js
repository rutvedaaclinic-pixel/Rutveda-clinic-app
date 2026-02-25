const express = require('express');
const router = express.Router();
const {
  getSummary,
  getDailyEarnings,
  getMonthlyGrowth,
  getYearlyGrowth,
  getRevenueSplit,
  getRecentPatients,
  getTopServices,
  getTopMedicines,
  getPerformance
} = require('../controllers/analyticsController');

// Authentication disabled for development
// const { protect } = require('../middleware/auth');
// router.use(protect);

// Analytics routes
router.get('/summary', getSummary);
router.get('/daily-earnings', getDailyEarnings);
router.get('/monthly-growth', getMonthlyGrowth);
router.get('/yearly-growth', getYearlyGrowth);
router.get('/revenue-split', getRevenueSplit);
router.get('/recent-patients', getRecentPatients);
router.get('/top-services', getTopServices);
router.get('/top-medicines', getTopMedicines);
router.get('/performance', getPerformance);

module.exports = router;