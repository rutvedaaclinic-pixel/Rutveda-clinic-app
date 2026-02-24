/**
 * Standard API Response Helpers
 */

// Success response
exports.successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

// Error response
exports.errorResponse = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  
  if (errors) {
    response.errors = errors;
  }
  
  return res.status(statusCode).json(response);
};

// Paginated response
exports.paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  const totalPages = Math.ceil(total / limit);
  
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
};

// Created response
exports.createdResponse = (res, data, message = 'Resource created successfully') => {
  return exports.successResponse(res, data, message, 201);
};

// No content response
exports.noContentResponse = (res) => {
  return res.status(204).send();
};

// Not found response
exports.notFoundResponse = (res, message = 'Resource not found') => {
  return exports.errorResponse(res, message, 404);
};

// Unauthorized response
exports.unauthorizedResponse = (res, message = 'Unauthorized') => {
  return exports.errorResponse(res, message, 401);
};

// Forbidden response
exports.forbiddenResponse = (res, message = 'Forbidden') => {
  return exports.errorResponse(res, message, 403);
};

// Bad request response
exports.badRequestResponse = (res, message = 'Bad request', errors = null) => {
  return exports.errorResponse(res, message, 400, errors);
};