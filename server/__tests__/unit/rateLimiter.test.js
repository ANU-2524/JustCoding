const {
  generalLimiter,
  aiLimiter,
  codeLimiter,
  rateLimitLogger
} = require('../../middleware/simpleRateLimiter');

describe('Rate Limiter Middleware', () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      path: '/test'
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  describe('rateLimitLogger', () => {
    it('should call next and log request', () => {
      rateLimitLogger(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('generalLimiter', () => {
    it('should be a function', () => {
      expect(typeof generalLimiter).toBe('function');
    });

    it('should allow requests under limit', () => {
      generalLimiter(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('aiLimiter', () => {
    it('should be a function', () => {
      expect(typeof aiLimiter).toBe('function');
    });
  });

  describe('codeLimiter', () => {
    it('should be a function', () => {
      expect(typeof codeLimiter).toBe('function');
    });
  });
});
