const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack || err.message);
  
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    statusCode = 400;
    message = `${field} already exists`;
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }
  
  // Mongoose Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = 'Resource not found';
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size too large. Max 5MB';
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Too many files uploaded';
  }
  
  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorHandler;