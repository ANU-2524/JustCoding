import AnalyzerPlugin from '../AnalyzerPlugin.js';
import AnalysisResult from '../AnalysisResult.js';
import { ESLint } from 'eslint';

class ESLintAnalyzer extends AnalyzerPlugin {
  constructor() {
    super('ESLint', '8.0.0', ['javascript', 'typescript']);
    this.config = {
      env: { browser: true, es2021: true, node: true },
      extends: ['eslint:recommended'],
      parserOptions: { ecmaVersion: 12, sourceType: 'module' },
      rules: {
        'no-unused-vars': 'warn',
        'no-undef': 'error',
        'prefer-const': 'warn',
        'no-var': 'error',
        'eqeqeq': 'warn',
        'no-console': 'off',
        'semi': ['error', 'always'],
        'quotes': ['warn', 'single'],
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error'
      }
    };
  }

  async analyze(code, language, options = {}) {
    const result = new AnalysisResult(this.name, this.version);
    const startTime = Date.now();

    try {
      const eslint = new ESLint({
        baseConfig: this.config,
        useEslintrc: false
      });

      const lintResults = await eslint.lintText(code, {
        filePath: `temp.${language === 'typescript' ? 'ts' : 'js'}`
      });

      if (lintResults[0] && lintResults[0].messages) {
        lintResults[0].messages.forEach((msg) => {
          const category = this.categorizeRule(msg.ruleId);
          result.addIssue({
            line: msg.line,
            column: msg.column,
            endLine: msg.endLine,
            endColumn: msg.endColumn,
            message: msg.message,
            severity: msg.severity === 2 ? 'error' : 'warning',
            category: category,
            ruleId: msg.ruleId
          });
        });
      }

      // Calculate metrics
      const errors = result.issues.filter(i => i.severity === 'error').length;
      const warnings = result.issues.filter(i => i.severity === 'warning').length;
      
      result.setMetrics({
        totalIssues: result.issues.length,
        errors,
        warnings,
        complexity: this.estimateComplexity(code)
      });

      // Calculate quality score
      const score = Math.max(0, 100 - (errors * 10) - (warnings * 2));
      result.setScore(score);

    } catch (error) {
      throw new Error(`ESLint analysis failed: ${error.message}`);
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  categorizeRule(ruleId) {
    if (!ruleId) return 'style';
    
    const securityRules = ['no-eval', 'no-implied-eval', 'no-new-func', 'no-script-url'];
    const bugRules = ['no-undef', 'no-unused-vars', 'no-unreachable'];
    const performanceRules = ['no-constant-condition', 'no-loop-func'];
    
    if (securityRules.some(r => ruleId.includes(r))) return 'security';
    if (bugRules.some(r => ruleId.includes(r))) return 'bug';
    if (performanceRules.some(r => ruleId.includes(r))) return 'performance';
    
    return 'style';
  }

  estimateComplexity(code) {
    const lines = code.split('\n').length;
    const branches = (code.match(/if|for|while|switch|catch/g) || []).length;
    return Math.min(10, Math.floor((lines / 10) + branches));
  }
}

export default ESLintAnalyzer;
