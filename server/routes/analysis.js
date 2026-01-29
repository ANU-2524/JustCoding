const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const AnalysisResult = require('../models/AnalysisResult');
const registry = require('../services/analysis/AnalyzerRegistry');
const ESLintAnalyzer = require('../services/analysis/analyzers/ESLintAnalyzer');
const SecurityAnalyzer = require('../services/analysis/analyzers/SecurityAnalyzer');
const ComplexityAnalyzer = require('../services/analysis/analyzers/ComplexityAnalyzer');
const AIAnalyzer = require('../services/analysis/analyzers/AIAnalyzer');
const { asyncHandler } = require('../middleware/async');
const { logger } = require('../services/logger');

// Initialize analyzers
let initialized = false;
const initializeAnalyzers = () => {
  if (initialized) return;
  
  registry.register(new ESLintAnalyzer());
  registry.register(new SecurityAnalyzer());
  registry.register(new ComplexityAnalyzer());
  registry.register(new AIAnalyzer());
  
  initialized = true;
  logger.info('Code quality analyzers initialized', registry.getStats());
};

// Legacy endpoint for backward compatibility
router.post('/analyze', asyncHandler(async (req, res) => {
  initializeAnalyzers();
  
  const { code, language } = req.body;

  if (!code || !language) {
    return res.status(400).json({
      error: 'Code and language are required'
    });
  }

  if (code.length > 10000) {
    return res.status(400).json({
      error: 'Code too long. Maximum 10,000 characters allowed.'
    });
  }

  // For JS/TS, use ESLint analyzer
  if (['javascript', 'typescript'].includes(language)) {
    const eslint = registry.get('ESLint');
    if (eslint) {
      const result = await eslint.analyze(code, language);
      return res.json({
        issues: result.issues,
        totalErrors: result.issues.filter(i => i.severity === 'error').length,
        totalWarnings: result.issues.filter(i => i.severity === 'warning').length,
        score: result.score
      });
    }
  }

  return res.json({
    issues: [],
    message: `Code quality analysis not available for ${language}`
  });
}));

// New comprehensive analysis endpoint
router.post('/analyze-full', asyncHandler(async (req, res) => {
  initializeAnalyzers();
  
  const { 
    code, 
    language, 
    userId, 
    challengeId, 
    submissionId,
    enableAI = false,
    useCache = true 
  } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'Code and language are required' });
  }

  if (code.length > 10000) {
    return res.status(400).json({ error: 'Code too long. Maximum 10,000 characters.' });
  }

  const codeHash = crypto.createHash('md5').update(code).digest('hex');
  
  // Check cache
  if (useCache) {
    const cached = await AnalysisResult.getByHash(codeHash);
    if (cached) {
      logger.info('Returning cached analysis', { codeHash });
      return res.json({ ...cached, cached: true });
    }
  }

  // Disable AI for now if not enabled
  if (!enableAI) {
    const aiAnalyzer = registry.get('AI-Powered');
    if (aiAnalyzer) aiAnalyzer.setEnabled(false);
  }

  // Run all analyzers
  const results = await registry.analyzeCode(code, language);
  
  // Re-enable AI
  if (!enableAI) {
    const aiAnalyzer = registry.get('AI-Powered');
    if (aiAnalyzer) aiAnalyzer.setEnabled(true);
  }

  // Aggregate results
  const summary = {
    totalIssues: 0,
    errors: 0,
    warnings: 0,
    infos: 0,
    byCategory: { security: 0, performance: 0, style: 0, bug: 0, smell: 0 }
  };

  let totalScore = 0;
  let scoreCount = 0;

  results.forEach(result => {
    result.issues.forEach(issue => {
      summary.totalIssues++;
      if (issue.severity === 'error') summary.errors++;
      else if (issue.severity === 'warning') summary.warnings++;
      else summary.infos++;
      
      if (issue.category && summary.byCategory[issue.category] !== undefined) {
        summary.byCategory[issue.category]++;
      }
    });

    if (result.score !== null && result.score !== undefined) {
      totalScore += result.score;
      scoreCount++;
    }
  });

  const overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : null;

  // Save to database
  const analysisRecord = new AnalysisResult({
    submissionId,
    challengeId,
    userId: userId || 'anonymous',
    language,
    codeHash,
    analyzers: results.map(r => ({
      name: r.analyzerName,
      version: r.analyzerVersion,
      executionTime: r.executionTime,
      issues: r.issues,
      metrics: r.metrics,
      suggestions: r.suggestions,
      score: r.score
    })),
    overallScore,
    summary,
    cached: false
  });

  await analysisRecord.save();

  logger.info('Code analysis completed', {
    language,
    analyzers: results.length,
    totalIssues: summary.totalIssues,
    score: overallScore
  });

  res.json({
    id: analysisRecord._id,
    analyzers: results,
    overallScore,
    summary,
    cached: false
  });
}));

// Get analysis by ID
router.get('/result/:id', asyncHandler(async (req, res) => {
  const analysis = await AnalysisResult.findById(req.params.id).lean();
  
  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found' });
  }

  res.json(analysis);
}));

// Get user analysis history
router.get('/history/:userId', asyncHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  const history = await AnalysisResult.find({ userId: req.params.userId })
    .sort({ analyzedAt: -1 })
    .limit(parseInt(limit))
    .select('-analyzers.issues')
    .lean();

  res.json({ history, count: history.length });
}));

// Get user statistics
router.get('/stats/:userId', asyncHandler(async (req, res) => {
  const stats = await AnalysisResult.getUserStats(req.params.userId);
  res.json({ stats: stats[0] || {} });
}));

// Get available analyzers
router.get('/analyzers', (req, res) => {
  initializeAnalyzers();
  
  const analyzers = registry.getAll().map(a => a.getMetadata());
  const stats = registry.getStats();
  
  res.json({ analyzers, stats });
});

// Enable/disable analyzer
router.post('/analyzers/:name/toggle', (req, res) => {
  initializeAnalyzers();
  
  const { enabled } = req.body;
  const analyzer = registry.get(req.params.name);
  
  if (!analyzer) {
    return res.status(404).json({ error: 'Analyzer not found' });
  }

  analyzer.setEnabled(enabled !== false);
  
  res.json({ 
    name: analyzer.name,
    enabled: analyzer.enabled 
  });
});

module.exports = router;
