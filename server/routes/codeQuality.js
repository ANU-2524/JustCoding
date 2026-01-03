const express = require('express');
const { ESLint } = require('eslint');
const router = express.Router();

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

router.post('/analyze', async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        error: 'Code and language are required',
      });
    }

    // Only support JavaScript and TypeScript for now
    if (!['javascript', 'typescript'].includes(language)) {
      return res.json({
        success: true,
        issues: [],
        message: `Code quality analysis not available for ${language}`,
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

    res.json({
      success: true,
      issues,
      fixedCode,
      totalErrors: issues.filter((i) => i.severity === 'error').length,
      totalWarnings: issues.filter((i) => i.severity === 'warning').length,
    });
  } catch (error) {
    console.error('Code quality analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze code quality',
      details: error.message,
    });
  }
});

module.exports = router;