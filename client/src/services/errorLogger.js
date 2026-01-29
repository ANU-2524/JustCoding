/**
 * Error Logging Service
 * Logs errors to browser storage and console for debugging
 */

const ERROR_LOG_KEY = 'app_error_logs';
const MAX_STORED_ERRORS = 20;

/**
 * Log an error to local storage
 * @param {Error} error - The error object
 * @param {Object} context - Additional context information
 */
export const logError = (error, context = {}) => {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    message: error?.message || 'Unknown error',
    stack: error?.stack || '',
    context,
    url: window.location.href,
    userAgent: navigator.userAgent
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem(ERROR_LOG_KEY)) || [];
    
    // Keep only the latest MAX_STORED_ERRORS
    const updatedLogs = [errorLog, ...existingLogs].slice(0, MAX_STORED_ERRORS);
    
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(updatedLogs));
    
    console.error('Error logged:', errorLog);
  } catch (e) {
    console.error('Failed to log error to storage:', e);
  }
};

/**
 * Get all stored error logs
 */
export const getErrorLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(ERROR_LOG_KEY)) || [];
  } catch (e) {
    console.error('Failed to retrieve error logs:', e);
    return [];
  }
};

/**
 * Clear all error logs
 */
export const clearErrorLogs = () => {
  try {
    localStorage.removeItem(ERROR_LOG_KEY);
  } catch (e) {
    console.error('Failed to clear error logs:', e);
  }
};

/**
 * Export error logs as JSON file
 */
export const exportErrorLogs = () => {
  try {
    const logs = getErrorLogs();
    const dataStr = JSON.stringify(logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `error-logs-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Failed to export error logs:', e);
  }
};

/**
 * Send error to remote logging service (if configured)
 * @param {Error} error - The error object
 * @param {Object} context - Additional context information
 */
export const sendErrorToServer = async (error, context = {}) => {
  try {
    const errorData = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || '',
      context,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    // Replace with your actual error reporting endpoint
    // await fetch('/api/errors/log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // });

    console.log('Error data ready for transmission:', errorData);
  } catch (e) {
    console.error('Failed to send error to server:', e);
  }
};

/**
 * Global error event handler
 */
export const setupGlobalErrorHandler = () => {
  window.addEventListener('error', (event) => {
    logError(event.error, {
      type: 'uncaught-error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, {
      type: 'unhandled-promise-rejection'
    });
  });
};

export default {
  logError,
  getErrorLogs,
  clearErrorLogs,
  exportErrorLogs,
  sendErrorToServer,
  setupGlobalErrorHandler
};
