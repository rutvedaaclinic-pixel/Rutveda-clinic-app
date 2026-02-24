const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. No token provided.'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Not authorized to access this route.'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated. Please contact administrator.'
        });
      }

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Invalid token.'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route.`
      });
    }
    next();
  };
};

// Optional auth - doesn't require token but sets user if present
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (error) {
        // Token is invalid, but we continue without user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Check if user owns the resource or is admin
exports.checkOwnership = (resourceField = 'createdBy') => {
  return (req, res, next) => {
    const resourceUserId = req.resource ? req.resource[resourceField]?.toString() : null;
    const currentUserId = req.user?._id?.toString();
    const isAdmin = req.user?.role === 'admin';

    if (!resourceUserId || !currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource.'
      });
    }

    if (resourceUserId !== currentUserId && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this resource.'
      });
    }

    next();
  };
};