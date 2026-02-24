const Patient = require('../models/Patient');
const Medicine = require('../models/Medicine');
const Service = require('../models/Service');
const Bill = require('../models/Bill');
const { successResponse } = require('../utils/response');

// @desc    Get dashboard summary
// @route   GET /api/analytics/summary
// @access  Private
exports.getSummary = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const patientsToday = await Patient.countDocuments({
      lastVisit: { $gte: today, $lt: tomorrow }
    });

    const todayBills = await Bill.find({
      createdAt: { $gte: today, $lt: tomorrow }
    });
    const earningsToday = todayBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    // Total counts
    const totalPatients = await Patient.countDocuments();
    const totalMedicines = await Medicine.countDocuments();
    const totalServices = await Service.countDocuments({ isActive: true });

    // Low stock alerts
    const lowStockCount = await Medicine.countDocuments({
      status: { $in: ['low-stock', 'out-of-stock'] }
    });

    // Expiring soon
    const expiringSoonCount = await Medicine.countDocuments({
      status: 'expiring-soon'
    });

    return successResponse(res, {
      patientsToday,
      earningsToday,
      totalPatients,
      totalMedicines,
      totalServices,
      lowStockCount,
      expiringSoonCount
    }, 'Dashboard summary retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily earnings data
// @route   GET /api/analytics/daily-earnings
// @access  Private
exports.getDailyEarnings = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = parseInt(days) - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayBills = await Bill.find({
        createdAt: { $gte: date, $lt: nextDate }
      });

      const earnings = dayBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      const patients = await Patient.countDocuments({
        lastVisit: { $gte: date, $lt: nextDate }
      });

      result.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toISOString().split('T')[0],
        earnings,
        patients
      });
    }

    return successResponse(res, result, 'Daily earnings data retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly growth data
// @route   GET /api/analytics/monthly-growth
// @access  Private
exports.getMonthlyGrowth = async (req, res, next) => {
  try {
    const result = [];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() - i + 1, 0, 23, 59, 59);

      const monthBills = await Bill.find({
        createdAt: { $gte: month, $lte: monthEnd }
      });

      const revenue = monthBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      const patients = await Patient.countDocuments({
        createdAt: { $gte: month, $lte: monthEnd }
      });

      result.push({
        month: month.toLocaleDateString('en-US', { month: 'short' }),
        year: month.getFullYear(),
        revenue,
        patients
      });
    }

    return successResponse(res, result, 'Monthly growth data retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get revenue breakdown
// @route   GET /api/analytics/revenue-split
// @access  Private
exports.getRevenueSplit = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.createdAt = {};
      if (startDate) dateQuery.createdAt.$gte = new Date(startDate);
      if (endDate) dateQuery.createdAt.$lte = new Date(endDate);
    }

    const bills = await Bill.find(dateQuery);

    const breakdown = {
      consultation: 0,
      medicines: 0,
      services: 0,
      total: 0
    };

    bills.forEach(bill => {
      breakdown.consultation += bill.consultationFee || 0;
      breakdown.medicines += bill.medicinesTotal || 0;
      breakdown.services += bill.servicesTotal || 0;
      breakdown.total += bill.totalAmount || 0;
    });

    // Calculate percentages
    const result = [
      {
        name: 'Consultation',
        value: breakdown.total > 0 ? Math.round((breakdown.consultation / breakdown.total) * 100) : 0,
        amount: breakdown.consultation
      },
      {
        name: 'Medicines',
        value: breakdown.total > 0 ? Math.round((breakdown.medicines / breakdown.total) * 100) : 0,
        amount: breakdown.medicines
      },
      {
        name: 'Services',
        value: breakdown.total > 0 ? Math.round((breakdown.services / breakdown.total) * 100) : 0,
        amount: breakdown.services
      }
    ];

    return successResponse(res, {
      breakdown: result,
      total: breakdown.total
    }, 'Revenue breakdown retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent patients
// @route   GET /api/analytics/recent-patients
// @access  Private
exports.getRecentPatients = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const patients = await Patient.find()
      .sort({ lastVisit: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .select('patientId name phone age gender lastVisit status');

    return successResponse(res, patients, 'Recent patients retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get top services
// @route   GET /api/analytics/top-services
// @access  Private
exports.getTopServices = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const result = await Bill.aggregate([
      { $unwind: '$services' },
      {
        $group: {
          _id: '$services.name',
          count: { $sum: 1 },
          revenue: { $sum: '$services.price' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: '$_id',
          count: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);

    return successResponse(res, result, 'Top services retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get top medicines
// @route   GET /api/analytics/top-medicines
// @access  Private
exports.getTopMedicines = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;

    const result = await Bill.aggregate([
      { $unwind: '$medicines' },
      {
        $group: {
          _id: '$medicines.name',
          count: { $sum: '$medicines.quantity' },
          revenue: { $sum: '$medicines.total' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          name: '$_id',
          quantitySold: '$count',
          revenue: 1,
          _id: 0
        }
      }
    ]);

    return successResponse(res, result, 'Top medicines retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Get performance metrics
// @route   GET /api/analytics/performance
// @access  Private
exports.getPerformance = async (req, res, next) => {
  try {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Total revenue and patients
    const totalBills = await Bill.find();
    const totalRevenue = totalBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const totalPatients = await Patient.countDocuments();

    // Average revenue per patient
    const avgRevenuePerPatient = totalPatients > 0 ? Math.round(totalRevenue / totalPatients) : 0;

    // This month's growth
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const thisMonthBills = await Bill.find({
      createdAt: { $gte: firstDayOfMonth }
    });
    const thisMonthRevenue = thisMonthBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    const lastMonthBills = await Bill.find({
      createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
    });
    const lastMonthRevenue = lastMonthBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    const growthPercentage = lastMonthRevenue > 0 
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : 0;

    // Average bill amount
    const avgBillAmount = totalBills.length > 0 
      ? Math.round(totalRevenue / totalBills.length)
      : 0;

    return successResponse(res, {
      totalRevenue,
      totalPatients,
      avgRevenuePerPatient,
      avgBillAmount,
      thisMonthRevenue,
      lastMonthRevenue,
      growthPercentage: parseFloat(growthPercentage)
    }, 'Performance metrics retrieved');
  } catch (error) {
    next(error);
  }
};