const express = require('express');
const { ESLint } = require('eslint');
const router = express.Router();
const { validate, logRequest } = require('../middleware/validation');

// Calculate cyclomatic complexity
function calculateComplexity(code) {
  const complexityKeywords = /(\bif\b|\belse\b|\bcase\b|\bcatch\b|\bfor\b|\bwhile\b|\b&&\b|\b\|\|\b|\b\?\b)/g;
  const matches = code.match(complexityKeywords);
  return matches ? Math.ceil(matches.length / 2) + 1 : 1;
}

// Calculate code metrics
function calculateMetrics(code) {
  const lines = code.split('\n');
  const nonEmptyLines = lines.filter(line => line.trim().length > 0).length;
  const commentLines = lines.filter(line => line.trim().startsWith('//')).length;
  const complexity = calculateComplexity(code);
  const hasDocComments = /\/\*\*[\s\S]*?\*\/|\/\/\//g.test(code);
  
  return {
    totalLines: lines.length,
    nonEmptyLines,
    commentLines,
    commentPercentage: (commentLines / nonEmptyLines * 100).toFixed(2),
    complexity,
    maintainability: complexity > 10 ? 'Low' : complexity > 5 ? 'Medium' : 'High',
    hasDocumentation: hasDocComments,
    avgLineLength: Math.round(code.length / lines.length)
  };
}

// ESLint configurations for different languages
const eslintConfigs = {
  javascript: {
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: ['eslint:recommended'],
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': 'warn',
      'no-console': 'off',
      'semi': ['error', 'always'],
      'quotes': ['warn', 'single'],
      'no-empty': 'warn',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error'
    },
  },
  typescript: {
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    extends: ['eslint:recommended'],
    parser: require.resolve('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': 'warn',
      'semi': ['error', 'always'],
      'no-explicit-any': 'warn'
    },
  },
};

/**
 * POST /api/code-quality/analyze
 * Analyze code quality using ESLint
 * Returns: { success, issues, fixedCode, totalErrors, totalWarnings }
 */
router.post('/analyze', validate('codeQuality'), async (req, res) => {
  try {
    const { code, language } = req.body || {};

    // Only support JavaScript and TypeScript for now
    if (!['javascript', 'typescript'].includes(language)) {
      return res.json({
        success: true,
        issues: [],
        totalErrors: 0,
        totalWarnings: 0,
        message: `Code quality analysis not available for ${language}`
      });

    }

    // Calculate metrics for all languages
    const metrics = calculateMetrics(code);

    // For JS/TS, use ESLint for detailed analysis
    if (['javascript', 'typescript'].includes(language)) {
      try {
        // Create ESLint instance with appropriate config
        const eslint = new ESLint({
          baseConfig: eslintConfigs[language],
          useEslintrc: false,
          fix: true,
        });

        // Lint the code
        const results = await eslint.lintText(code, {
          filePath: `temp.${language === 'typescript' ? 'ts' : 'js'}`,
          fix: true,
        });

        // Format results
        const issues = [];
        if (results[0] && results[0].messages) {
          results[0].messages.forEach((message) => {
            issues.push({
              line: message.line,
              column: message.column,
              message: message.message,
              severity: message.severity === 2 ? 'error' : 'warning',
              ruleId: message.ruleId,
              endLine: message.endLine,
              endColumn: message.endColumn,
            });
          });
        }

        // Try to get fixed code if possible
        let fixedCode = null;
        try {
          const fixedResults = await ESLint.outputFixes(results);
          if (fixedResults && results[0].output) {
            fixedCode = results[0].output;
          }
        } catch (fixError) {
          // Ignore fix errors
        }

        const totalErrors = issues.filter((i) => i.severity === 'error').length;
        const totalWarnings = issues.filter((i) => i.severity === 'warning').length;

        logRequest(req, `Code analysis completed: ${totalErrors} errors, ${totalWarnings} warnings`);

        return res.json({
          issues,
          fixedCode,
          totalErrors,
          totalWarnings,
          metrics,
          language
        });
      } catch (error) {
        const isParseError = error.message && error.message.toLowerCase().includes('parsing error');
        const status = isParseError ? 400 : 500;
        logRequest(req, `Code quality analysis error: ${error.message}`, status === 400 ? 'warn' : 'error');
        return res.status(status).json({
          error: isParseError ? 'Unable to parse code. Please check syntax and try again.' : 'Failed to analyze code quality',
          details: error.message,
        });
      }
    } else {
      // For other languages, provide basic analysis without ESLint
      const basicIssues = [];
      const lines = code.split('\n');

      // Basic checks for security issues
      if (language === 'python' && /exec\(|eval\(|__import__/.test(code)) {
        basicIssues.push({
          line: lines.findIndex(l => /exec\(|eval\(|__import__/.test(l)) + 1,
          column: 0,
          message: 'Use of potentially unsafe function detected',
          severity: 'error',
          ruleId: 'security-risk'
        });
      }

      if (language === 'java' && /Runtime\.getRuntime\(\)\.exec/.test(code)) {
        basicIssues.push({
          line: lines.findIndex(l => /Runtime\.getRuntime\(\)\.exec/.test(l)) + 1,
          column: 0,
          message: 'Runtime.exec() detected - consider safer alternatives',
          severity: 'warning',
          ruleId: 'security-risk'
        });
      }

    res.json({
      success: true,
      issues,
      fixedCode,
      totalErrors,
      totalWarnings
    });
  } catch (error) {
    logRequest(req, `Unexpected error: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to analyze code quality',
      details: error.message
    });
  }
});

module.exports = router;