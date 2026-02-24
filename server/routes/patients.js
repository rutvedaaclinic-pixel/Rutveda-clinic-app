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

router.route('/:id')
  .get(validateObjectId('id'), getPatient)
  .put(validateObjectId('id'), validatePatient, updatePatient)
  .delete(validateObjectId('id'), deletePatient);

// Additional routes
router.put('/:id/visit', validateObjectId('id'), updateVisit);

module.exports = router;