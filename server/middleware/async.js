/**
 * Async Handler Middleware
 * Wraps async route handlers to eliminate repetitive try-catch blocks
 * Automatically forwards errors to the global error handler
 */

/**
 * Wrap an async function to handle promise rejections
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Alternative: Wrap multiple middleware functions
 * @param  {...Function} fns - Multiple async handlers
 * @returns {Array} Array of wrapped middleware functions
 */
const asyncHandlerAll = (...fns) => {
  return fns.map(fn => asyncHandler(fn));
};

/**
 * Wrap async function with custom error transformation
 * @param {Function} fn - Async route handler function
 * @param {Function} errorTransformer - Function to transform errors before forwarding
 * @returns {Function} Express middleware function
 */
const asyncHandlerWithTransform = (fn, errorTransformer) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    const transformedError = errorTransformer ? errorTransformer(error) : error;
    next(transformedError);
  });
};

module.exports = {
  asyncHandler,
  asyncHandlerAll,
  asyncHandlerWithTransform
};
