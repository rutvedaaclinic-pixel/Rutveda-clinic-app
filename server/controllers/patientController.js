const Patient = require('../models/Patient');
const { successResponse, errorResponse, paginatedResponse, notFoundResponse } = require('../utils/response');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private
exports.getPatients = async (req, res, next) => {
  try {
    const { search, filter, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { patientId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter functionality
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.lastVisit = { $gte: today, $lt: tomorrow };
    } else if (filter === 'month') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      query.lastVisit = { $gte: firstDay };
    }

    // Count total documents
    const total = await Patient.countDocuments(query);

    // Get patients with pagination
    const patients = await Patient.find(query)
      .sort({ lastVisit: -1, createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    return paginatedResponse(res, patients, parseInt(page), parseInt(limit), total, 'Patients retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's patients
// @route   GET /api/patients/today
// @access  Private
exports.getTodayPatients = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const patients = await Patient.find({
      lastVisit: { $gte: today, $lt: tomorrow }
    }).sort({ createdAt: -1 });

    return successResponse(res, patients, 'Today\'s patients retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Public
exports.getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return notFoundResponse(res, 'Patient not found');
    }

    return successResponse(res, patient, 'Patient retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Public (temporarily)
exports.createPatient = async (req, res, next) => {
  try {
    // Generate patient ID
    const patientId = await Patient.generatePatientId();

    // Create patient (createdBy removed for development)
    const patient = await Patient.create({
      ...req.body,
      patientId
    });

    return successResponse(res, patient, 'Patient created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Public
exports.updatePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return notFoundResponse(res, 'Patient not found');
    }

    // Update patient
    const updatedPatient = await Patient.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );

    return successResponse(res, updatedPatient, 'Patient updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private
exports.deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return notFoundResponse(res, 'Patient not found');
    }

    await patient.deleteOne();

    return successResponse(res, null, 'Patient deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update patient visit
// @route   PUT /api/patients/:id/visit
// @access  Private
exports.updateVisit = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return notFoundResponse(res, 'Patient not found');
    }

    patient.lastVisit = new Date();
    patient.status = 'Active';
    await patient.save();

    return successResponse(res, patient, 'Patient visit updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Search patients
// @route   GET /api/patients/search
// @access  Private
exports.searchPatients = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q) {
      return successResponse(res, [], 'Search query is required');
    }

    const patients = await Patient.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { patientId: { $regex: q, $options: 'i' } }
      ]
    })
      .limit(10)
      .select('patientId name phone age gender lastVisit status');

    return successResponse(res, patients, 'Search results');
  } catch (error) {
    next(error);
  }
};

// @desc    Get patient statistics
// @route   GET /api/patients/stats
// @access  Private
exports.getPatientStats = async (req, res, next) => {
  try {
    const totalPatients = await Patient.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayPatients = await Patient.countDocuments({
      lastVisit: { $gte: today, $lt: tomorrow }
    });

    const activePatients = await Patient.countDocuments({ status: 'Active' });
    const inactivePatients = await Patient.countDocuments({ status: 'Inactive' });

    // This month's patients
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyPatients = await Patient.countDocuments({
      createdAt: { $gte: firstDayOfMonth }
    });

    return successResponse(res, {
      total: totalPatients,
      today: todayPatients,
      active: activePatients,
      inactive: inactivePatients,
      thisMonth: monthlyPatients
    }, 'Patient statistics retrieved');
  } catch (error) {
    next(error);
  }
};