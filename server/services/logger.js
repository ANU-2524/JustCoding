/**
 * Structured Logging Service using Winston
 * Professional logging with different levels and file logging for production
 */
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'development' ? 'debug' : 'info';
};

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    
    return msg;
  })
);

// JSON format for file output (production)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports based on environment
const getTransports = () => {
  const transports = [
    // Console transport - always enabled
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ];

  // Add file transports in production
  if (process.env.NODE_ENV === 'production') {
    const logsDir = process.env.LOGS_DIR || path.join(__dirname, '../logs');
    
    transports.push(
      // Error log file
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      // Combined log file
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
        format: fileFormat,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    );
  }

  return transports;
};

// Create the logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  transports: getTransports(),
  exitOnError: false, // Do not exit on handled exceptions
});

// HTTP request logging middleware
const httpLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log when response finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    };

    // Choose log level based on status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Request', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.http('HTTP Request', logData);
    }
  });

  next();
};

// Helper methods for common logging patterns
const logError = (message, error, metadata = {}) => {
  logger.error(message, {
    ...metadata,
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error.statusCode && { statusCode: error.statusCode }),
      ...(error.errorCode && { errorCode: error.errorCode }),
    },
  });
};

const logRequest = (req, message, metadata = {}) => {
  logger.info(message, {
    ...metadata,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
  });
};

const logDatabase = (operation, collection, duration, metadata = {}) => {
  logger.debug('Database Operation', {
    ...metadata,
    operation,
    collection,
    duration: `${duration}ms`,
  });
};

const logExternalService = (service, operation, duration, success, metadata = {}) => {
  const level = success ? 'info' : 'warn';
  logger[level]('External Service Call', {
    ...metadata,
    service,
    operation,
    duration: `${duration}ms`,
    success,
  });
};

export {
  logger,
  httpLogger,
  logError,
  logRequest,
  logDatabase,
  logExternalService,
};
