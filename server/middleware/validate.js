const { validationResult, body, param, query } = require('express-validator');

// Validation error handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

// Patient validation rules
exports.validatePatient = [
  body('name')
    .trim()
    .notEmpty().withMessage('Patient name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Please enter a valid phone number'),
  
  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 0, max: 120 }).withMessage('Age must be between 0 and 120'),
  
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender value'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please enter a valid email'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),
  
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', '']),
  
  body('medicalHistory')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Medical history cannot exceed 2000 characters'),
  
  exports.handleValidationErrors
];

// Medicine validation rules
exports.validateMedicine = [
  body('name')
    .trim()
    .notEmpty().withMessage('Medicine name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be between 2 and 200 characters'),
  
  body('buyingPrice')
    .notEmpty().withMessage('Buying price is required')
    .isFloat({ min: 0 }).withMessage('Buying price must be a positive number'),
  
  body('sellingPrice')
    .notEmpty().withMessage('Selling price is required')
    .isFloat({ min: 0 }).withMessage('Selling price must be a positive number'),
  
  body('stock')
    .notEmpty().withMessage('Stock quantity is required')
    .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
  
  body('expiryDate')
    .notEmpty().withMessage('Expiry date is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiry date must be in the future');
      }
      return true;
    }),
  
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Manufacturer name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  
  body('category')
    .optional()
    .isIn(['tablets', 'capsules', 'syrup', 'injection', 'cream', 'drops', 'other', '']),
  
  exports.handleValidationErrors
];

// Service validation rules
exports.validateService = [
  body('name')
    .trim()
    .notEmpty().withMessage('Service name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('duration')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Duration cannot exceed 50 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  exports.handleValidationErrors
];

// Bill validation rules
exports.validateBill = [
  body('patient')
    .notEmpty().withMessage('Patient is required')
    .isMongoId().withMessage('Invalid patient ID'),
  
  body('consultationFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number'),
  
  body('medicines')
    .optional()
    .isArray().withMessage('Medicines must be an array'),
  
  body('medicines.*.medicine')
    .optional()
    .isMongoId().withMessage('Invalid medicine ID'),
  
  body('medicines.*.name')
    .optional()
    .trim()
    .notEmpty().withMessage('Medicine name is required'),
  
  body('medicines.*.price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Medicine price must be positive'),
  
  body('medicines.*.quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  
  body('services')
    .optional()
    .isArray().withMessage('Services must be an array'),
  
  body('services.*.service')
    .optional()
    .isMongoId().withMessage('Invalid service ID'),
  
  body('services.*.name')
    .optional()
    .trim()
    .notEmpty().withMessage('Service name is required'),
  
  body('services.*.price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Service price must be positive'),
  
  body('paymentStatus')
    .optional()
    .isIn(['paid', 'pending', 'partial']).withMessage('Invalid payment status'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'upi', 'other', '']).withMessage('Invalid payment method'),
  
  exports.handleValidationErrors
];

// User registration validation
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'doctor', 'receptionist']).withMessage('Invalid role'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[0-9]{10,15}$/).withMessage('Please enter a valid phone number'),
  
  exports.handleValidationErrors
];

// Login validation
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  exports.handleValidationErrors
];

// MongoDB ObjectId validation
exports.validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId().withMessage(`Invalid ${paramName} format`),
  
  exports.handleValidationErrors
];

// Pagination validation
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  exports.handleValidationErrors
];
