/**
 * Global Error Handling Middleware
 * Catches all errors and sends uniform JSON responses
 */
const { ErrorResponse } = require('../utils/ErrorResponse');
const { logger, logError } = require('../services/logger');

/**
 * Handle Mongoose CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ErrorResponse(message, 400, 'INVALID_ID');
};

/**
 * Handle Mongoose Duplicate Key Error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `Duplicate value for field: ${field}`;
  return new ErrorResponse(message, 409, 'DUPLICATE_KEY');
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  const message = 'Validation failed';
  const error = new ErrorResponse(message, 400, 'VALIDATION_ERROR');
  error.errors = errors;
  return error;
};

/**
 * Handle JWT Errors
 */
const handleJWTError = () => {
  return new ErrorResponse('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');
};

const handleJWTExpiredError = () => {
  return new ErrorResponse('Token expired. Please log in again.', 401, 'TOKEN_EXPIRED');
};

/**
 * Handle Syntax Errors (malformed JSON)
 */
const handleSyntaxError = (err) => {
  return new ErrorResponse('Invalid JSON in request body', 400, 'INVALID_JSON');
};

/**
 * Send error response in development mode (with stack trace)
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      message: err.message,
      code: err.errorCode || 'ERROR',
      statusCode: err.statusCode,
      stack: err.stack,
      ...(err.errors && { errors: err.errors }),
    },
  });
};

/**
 * Send error response in production mode (without sensitive info)
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.errorCode || 'ERROR',
        ...(err.errors && { errors: err.errors }),
      },
    });
  } else {
    // Programming or unknown error: don't leak details
    logError('Unexpected Error', err);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Something went wrong. Please try again later.',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Clone error to avoid mutating the original
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;
  error.statusCode = err.statusCode || 500;
  error.errorCode = err.errorCode;
  error.isOperational = err.isOperational || false;
  error.errors = err.errors;

  // Log the error
  logError(`${req.method} ${req.originalUrl}`, err, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Handle specific error types
  if (err.name === 'CastError') {
    error = handleCastError(err);
  }

  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  }

  if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  }

  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }

  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error = handleSyntaxError(err);
  }

  // Send response based on environment
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new ErrorResponse(
    `Cannot ${req.method} ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

/**
 * Unhandled Rejection Handler (for promises)
 */
const setupUnhandledRejectionHandler = (server) => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    
    // Close server & exit process
    server.close(() => {
      process.exit(1);
    });
  });
};

/**
 * Uncaught Exception Handler
 */
const setupUncaughtExceptionHandler = () => {
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', {
      message: err.message,
      stack: err.stack,
    });
    
    process.exit(1);
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  setupUnhandledRejectionHandler,
  setupUncaughtExceptionHandler,
};
