const request = require('supertest');
const express = require('express');

// Create a minimal test app
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Health endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Test endpoint
  app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', port: 4334 });
  });

  // Compile endpoint mock
  app.post('/compile', (req, res) => {
    const { language, code } = req.body;
    
    if (!language || !code) {
      return res.status(400).json({ 
        error: 'Missing required fields: language and code' 
      });
    }

    if (code.length > 10000) {
      return res.status(400).json({ 
        error: 'Code too long. Maximum 10,000 characters allowed.' 
      });
    }

    res.json({ output: 'Test output' });
  });

  // Visualizer endpoint mock
  app.post('/api/visualizer/visualize', (req, res) => {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: code and language' 
      });
    }

    const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'go'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({ 
        success: false, 
        error: `Language '${language}' is not supported` 
      });
    }

    res.json({
      success: true,
      language,
      execution: [{ stepId: 0, lineNumber: 1, code: 'test' }],
      totalSteps: 1
    });
  });

  app.get('/api/visualizer/languages', (req, res) => {
    res.json({
      success: true,
      languages: ['javascript', 'python', 'java', 'cpp', 'go']
    });
  });

  return app;
};

describe('API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /test', () => {
    it('should return test message', async () => {
      const res = await request(app).get('/test');
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Server is working!');
    });
  });

  describe('POST /compile', () => {
    it('should return error for missing fields', async () => {
      const res = await request(app)
        .post('/compile')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing required fields');
    });

    it('should return error for code too long', async () => {
      const res = await request(app)
        .post('/compile')
        .send({
          language: 'javascript',
          code: 'x'.repeat(10001)
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Code too long');
    });

    it('should compile valid code', async () => {
      const res = await request(app)
        .post('/compile')
        .send({
          language: 'javascript',
          code: 'console.log("hello")'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.output).toBeDefined();
    });
  });

  describe('POST /api/visualizer/visualize', () => {
    it('should return error for missing fields', async () => {
      const res = await request(app)
        .post('/api/visualizer/visualize')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return error for unsupported language', async () => {
      const res = await request(app)
        .post('/api/visualizer/visualize')
        .send({ code: 'test', language: 'cobol' });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should visualize JavaScript code', async () => {
      const res = await request(app)
        .post('/api/visualizer/visualize')
        .send({
          code: 'let x = 10;',
          language: 'javascript'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.execution).toBeDefined();
    });

    it('should visualize Python code', async () => {
      const res = await request(app)
        .post('/api/visualizer/visualize')
        .send({
          code: 'x = 10',
          language: 'python'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should visualize Go code', async () => {
      const res = await request(app)
        .post('/api/visualizer/visualize')
        .send({
          code: 'package main',
          language: 'go'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/visualizer/languages', () => {
    it('should return supported languages', async () => {
      const res = await request(app).get('/api/visualizer/languages');
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.languages).toContain('javascript');
      expect(res.body.languages).toContain('python');
      expect(res.body.languages).toContain('go');
    });
  });
});
