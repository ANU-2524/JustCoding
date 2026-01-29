/**
 * Centralized Validation Middleware
 * Provides reusable validation utilities for request validation
 */

// Validation error class for consistent error handling
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

// Common validation rules
const validators = {
  /**
   * Validate string field
   */
  isString: (value, fieldName) => {
    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`, fieldName);
    }
    return true;
  },

  /**
   * Validate non-empty string
   */
  isNonEmptyString: (value, fieldName) => {
    validators.isString(value, fieldName);
    if (value.trim().length === 0) {
      throw new ValidationError(`${fieldName} cannot be empty`, fieldName);
    }
    return true;
  },

  /**
   * Validate string length
   */
  maxLength: (value, maxLen, fieldName) => {
    if (typeof value === 'string' && value.length > maxLen) {
      throw new ValidationError(`${fieldName} too long. Maximum ${maxLen} characters allowed.`, fieldName);
    }
    return true;
  },

  /**
   * Validate string minimum length
   */
  minLength: (value, minLen, fieldName) => {
    if (typeof value === 'string' && value.length < minLen) {
      throw new ValidationError(`${fieldName} too short. Minimum ${minLen} characters required.`, fieldName);
    }
    return true;
  },

  /**
   * Validate value is in allowed list
   */
  isOneOf: (value, allowedValues, fieldName) => {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(
        `Invalid ${fieldName}. Must be one of: ${allowedValues.join(', ')}`,
        fieldName
      );
    }
    return true;
  },

  /**
   * Validate positive integer
   */
  isPositiveInt: (value, fieldName, max = null) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num <= 0) {
      throw new ValidationError(`${fieldName} must be a positive integer`, fieldName);
    }
    if (max !== null && num > max) {
      throw new ValidationError(`${fieldName} cannot exceed ${max}`, fieldName);
    }
    return true;
  },

  /**
   * Validate userId format
   */
  isValidUserId: (userId) => {
    if (typeof userId !== 'string' || userId.length === 0 || userId.length > 100) {
      throw new ValidationError('Invalid userId format', 'userId');
    }
    return true;
  },

  /**
   * Validate optional field (only validates if present)
   */
  optional: (value, validator, ...args) => {
    if (value === undefined || value === null) {
      return true;
    }
    return validator(value, ...args);
  }
};

// Validation schemas for different endpoints
const schemas = {
  // GPT Explain endpoint
  gptExplain: {
    validate: (body) => {
      const { question } = body;
      validators.isNonEmptyString(question, 'question');
      validators.maxLength(question, 2000, 'question');
      return true;
    }
  },

  // GPT Debug endpoint
  gptDebug: {
    validate: (body) => {
      const { code, errorMessage } = body;
      validators.isNonEmptyString(code, 'code');
      validators.maxLength(code, 10000, 'code');
      validators.optional(errorMessage, validators.isString, 'errorMessage');
      validators.optional(errorMessage, validators.maxLength, 5000, 'errorMessage');
      return true;
    }
  },

  // Code compile endpoint
  compile: {
    supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'ruby', 'php', 'swift', 'rust'],
    validate: (body) => {
      const { language, code, stdin } = body;
      validators.isNonEmptyString(language, 'language');
      validators.isNonEmptyString(code, 'code');
      validators.isOneOf(language, schemas.compile.supportedLanguages, 'language');
      validators.maxLength(code, 10000, 'code');
      validators.optional(stdin, validators.maxLength, 1000, 'stdin');
      return true;
    }
  },

  // Code quality analyze endpoint
  codeQuality: {
    supportedLanguages: ['javascript', 'typescript'],
    validate: (body) => {
      const { code, language } = body;
      validators.isNonEmptyString(code, 'code');
      validators.isNonEmptyString(language, 'language');
      validators.maxLength(code, 10000, 'code');
      return true;
    }
  },

  // Visualizer endpoint
  visualizer: {
    supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'go'],
    validate: (body) => {
      const { code, language } = body;
      validators.isNonEmptyString(code, 'code');
      validators.isNonEmptyString(language, 'language');
      validators.isOneOf(language, schemas.visualizer.supportedLanguages, 'language');
      return true;
    }
  },

  // Progress event endpoint
  progressEvent: {
    validEventTypes: ['code_run', 'code_submit', 'challenge_solve', 'tutorial_view', 'login'],
    validate: (body) => {
      const { userId, eventType } = body;
      validators.isValidUserId(userId);
      validators.isNonEmptyString(eventType, 'eventType');
      validators.isOneOf(eventType, schemas.progressEvent.validEventTypes, 'eventType');
      return true;
    }
  },

  // Leaderboard query
  leaderboard: {
    validTimeframes: ['weekly', 'monthly', 'all-time'],
    validate: (query) => {
      const { limit, timeframe } = query;
      if (limit !== undefined) {
        validators.isPositiveInt(limit, 'limit', 100);
      }
      if (timeframe !== undefined) {
        validators.isOneOf(timeframe, schemas.leaderboard.validTimeframes, 'timeframe');
      }
      return true;
    }
  }
};

/**
 * Create validation middleware from schema
 * @param {string} schemaName - Name of the schema to use
 * @param {string} source - 'body', 'query', or 'params'
 */
function validate(schemaName, source = 'body') {
  return (req, res, next) => {
    try {
      const schema = schemas[schemaName];
      if (!schema) {
        console.error(`Validation schema '${schemaName}' not found`);
        return next();
      }
      
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      schema.validate(data);
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json({
          error: error.message,
          field: error.field
        });
      }
      next(error);
    }
  };
}

/**
 * Sanitize string input (basic XSS prevention)
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Logging helper for request tracking
 */
function logRequest(req, message, level = 'info') {
  const logData = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    message
  };
  console[level](JSON.stringify(logData));
}

export {
  ValidationError,
  validators,
  schemas,
  validate,
  sanitizeString,
  logRequest
};
