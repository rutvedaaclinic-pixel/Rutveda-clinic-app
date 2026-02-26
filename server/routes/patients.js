const express = require('express');
const router = express.Router();
const { validatePatient, validateObjectId } = require('../middleware/validate');
const {
  getPatients,
  getTodayPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  updateVisit,
  addVisit,
  getPatientWithDetails,
  searchPatients,
  getPatientStats
} = require('../controllers/patientController');

// Authentication disabled for development
// const { protect } = require('../middleware/auth');
// router.use(protect);

// Special routes (must be before /:id)
router.get('/today', getTodayPatients);
router.get('/search', searchPatients);
router.get('/stats', getPatientStats);

// CRUD routes
router.route('/')
  .get(getPatients)
  .post(validatePatient, createPatient);

// Patient details route (must be before /:id to avoid route conflict)
router.get('/:id/details', validateObjectId('id'), getPatientWithDetails);

// Additional routes for visits
router.put('/:id/visit', validateObjectId('id'), updateVisit);
router.post('/:id/visits', validateObjectId('id'), addVisit);

// Patient CRUD by ID (must be after specific routes like /:id/details)
router.route('/:id')
  .get(validateObjectId('id'), getPatient)
  .put(validateObjectId('id'), validatePatient, updatePatient)
  .delete(validateObjectId('id'), deletePatient);

module.exports = router;
