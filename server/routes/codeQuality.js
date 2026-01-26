const express = require('express');
const { ESLint } = require('eslint');
const router = express.Router();
const { validate, logRequest } = require('../middleware/validation');

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
    },
  },
  typescript: {
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
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': 'warn',
      'semi': ['error', 'always'],
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
    const { code, language } = req.body;

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

    // Create ESLint instance with appropriate config
    const eslint = new ESLint({
      baseConfig: eslintConfigs[language],
      useEslintrc: false,
    });

    // Lint the code
    const results = await eslint.lintText(code, {
      filePath: `temp.${language === 'typescript' ? 'ts' : 'js'}`,
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

    res.json({
      success: true,
      issues,
      fixedCode,
      totalErrors,
      totalWarnings
    });
  } catch (error) {
    logRequest(req, `Code quality analysis error: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to analyze code quality',
      details: error.message
    });
  }
});

module.exports = router;