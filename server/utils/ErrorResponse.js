/**
 * Custom Error Response Class
 * Standardizes error types with status codes and messages
 */
class ErrorResponse extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // Distinguishes operational errors from programming errors
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error types for common scenarios
class BadRequestError extends ErrorResponse {
  constructor(message = 'Bad Request', errorCode = 'BAD_REQUEST') {
    super(message, 400, errorCode);
  }
}

class UnauthorizedError extends ErrorResponse {
  constructor(message = 'Unauthorized', errorCode = 'UNAUTHORIZED') {
    super(message, 401, errorCode);
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(message = 'Forbidden', errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

class NotFoundError extends ErrorResponse {
  constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

class ConflictError extends ErrorResponse {
  constructor(message = 'Resource conflict', errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

class ValidationError extends ErrorResponse {
  constructor(message = 'Validation failed', errors = [], errorCode = 'VALIDATION_ERROR') {
    super(message, 400, errorCode);
    this.errors = errors; // Array of field-specific errors
  }
}

class RateLimitError extends ErrorResponse {
  constructor(message = 'Too many requests', errorCode = 'RATE_LIMIT_EXCEEDED') {
    super(message, 429, errorCode);
  }
}

class InternalServerError extends ErrorResponse {
  constructor(message = 'Internal server error', errorCode = 'INTERNAL_ERROR') {
    super(message, 500, errorCode);
  }
}

class ServiceUnavailableError extends ErrorResponse {
  constructor(message = 'Service temporarily unavailable', errorCode = 'SERVICE_UNAVAILABLE') {
    super(message, 503, errorCode);
  }
}

class DatabaseError extends ErrorResponse {
  constructor(message = 'Database operation failed', errorCode = 'DATABASE_ERROR') {
    super(message, 503, errorCode);
  }
}

class ExternalServiceError extends ErrorResponse {
  constructor(message = 'External service error', errorCode = 'EXTERNAL_SERVICE_ERROR') {
    super(message, 502, errorCode);
  }
}

export {
  ErrorResponse,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
  DatabaseError,
  ExternalServiceError
};
