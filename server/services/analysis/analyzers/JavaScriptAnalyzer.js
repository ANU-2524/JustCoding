import AnalyzerPlugin from '../AnalyzerPlugin.js';

class JavaScriptAnalyzer extends AnalyzerPlugin {
  constructor() {
    super({
      name: 'JavaScriptAnalyzer',
      version: '1.0.0',
      supportedLanguages: ['javascript', 'typescript'],
      timeout: 10000
    });
  }

  async analyze(code, language, options = {}) {
    const issues = [];

    // Basic code smells detection
    this.detectConsoleLog(code, issues);
    this.detectVarUsage(code, issues);
    this.detectEqualityOperators(code, issues);
    this.detectLongFunctions(code, issues);
    this.detectMagicNumbers(code, issues);
    this.detectEmptyCatch(code, issues);
    this.detectNestedCallbacks(code, issues);

    const score = this.calculateScore(issues);

    return {
      issues,
      score,
      suggestions: this.generateSuggestions(issues)
    };
  }

  detectConsoleLog(code, issues) {
    const regex = /console\.(log|warn|error|info|debug)/g;
    let match;
    const lines = code.split('\n');
    
    while ((match = regex.exec(code)) !== null) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      issues.push({
        line: lineNum,
        column: match.index - code.lastIndexOf('\n', match.index),
        message: `Remove console.${match[1]}() before production`,
        severity: 'warning',
        category: 'best-practice',
        ruleId: 'no-console'
      });
    }
  }

  detectVarUsage(code, issues) {
    const regex = /\bvar\s+\w+/g;
    let match;
    
    while ((match = regex.exec(code)) !== null) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      issues.push({
        line: lineNum,
        column: match.index - code.lastIndexOf('\n', match.index),
        message: 'Use "let" or "const" instead of "var"',
        severity: 'warning',
        category: 'best-practice',
        ruleId: 'no-var'
      });
    }
  }

  detectEqualityOperators(code, issues) {
    const regex = /[^=!<>]==[^=]/g;
    let match;
    
    while ((match = regex.exec(code)) !== null) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      issues.push({
        line: lineNum,
        column: match.index - code.lastIndexOf('\n', match.index),
        message: 'Use "===" instead of "==" for comparison',
        severity: 'warning',
        category: 'best-practice',
        ruleId: 'eqeqeq'
      });
    }
  }

  detectLongFunctions(code, issues) {
    const functionRegex = /function\s+\w+\s*\([^)]*\)\s*{/g;
    let match;
    
    while ((match = functionRegex.exec(code)) !== null) {
      const startIndex = match.index;
      const braceCount = this.countBraces(code.substring(startIndex));
      const functionCode = code.substring(startIndex, startIndex + braceCount);
      const lineCount = functionCode.split('\n').length;
      
      if (lineCount > 50) {
        const lineNum = code.substring(0, match.index).split('\n').length;
        issues.push({
          line: lineNum,
          column: 0,
          message: `Function is too long (${lineCount} lines). Consider breaking it into smaller functions.`,
          severity: 'info',
          category: 'maintainability',
          ruleId: 'max-lines-per-function'
        });
      }
    }
  }

  detectMagicNumbers(code, issues) {
    const regex = /(?<![a-zA-Z0-9_])([2-9]|[1-9]\d+)(?![a-zA-Z0-9_])/g;
    let match;
    const lines = code.split('\n');
    
    while ((match = regex.exec(code)) !== null) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      const line = lines[lineNum - 1];
      
      // Skip if it's in a comment or string
      if (!line.includes('//') || match.index < line.indexOf('//')) {
        issues.push({
          line: lineNum,
          column: match.index - code.lastIndexOf('\n', match.index),
          message: `Magic number "${match[1]}". Consider using a named constant.`,
          severity: 'info',
          category: 'maintainability',
          ruleId: 'no-magic-numbers'
        });
      }
    }
  }

  detectEmptyCatch(code, issues) {
    const regex = /catch\s*\([^)]*\)\s*{\s*}/g;
    let match;
    
    while ((match = regex.exec(code)) !== null) {
      const lineNum = code.substring(0, match.index).split('\n').length;
      issues.push({
        line: lineNum,
        column: 0,
        message: 'Empty catch block. Handle errors properly or add a comment explaining why.',
        severity: 'warning',
        category: 'error-handling',
        ruleId: 'no-empty-catch'
      });
    }
  }

  detectNestedCallbacks(code, issues) {
    const lines = code.split('\n');
    let nestingLevel = 0;
    
    lines.forEach((line, index) => {
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      nestingLevel += openBraces - closeBraces;
      
      if (nestingLevel > 4 && line.includes('function') || line.includes('=>')) {
        issues.push({
          line: index + 1,
          column: 0,
          message: 'Deep callback nesting detected. Consider using async/await or Promises.',
          severity: 'warning',
          category: 'complexity',
          ruleId: 'max-nested-callbacks'
        });
      }
    });
  }

  countBraces(code) {
    let count = 1;
    let index = code.indexOf('{') + 1;
    
    while (count > 0 && index < code.length) {
      if (code[index] === '{') count++;
      if (code[index] === '}') count--;
      index++;
    }
    
    return index;
  }

  generateSuggestions(issues) {
    const suggestions = [];
    const categories = {};
    
    issues.forEach(issue => {
      categories[issue.category] = (categories[issue.category] || 0) + 1;
    });
    
    if (categories['best-practice'] > 0) {
      suggestions.push('Follow JavaScript best practices for cleaner code');
    }
    if (categories['maintainability'] > 0) {
      suggestions.push('Improve code maintainability by extracting constants and smaller functions');
    }
    if (categories['error-handling'] > 0) {
      suggestions.push('Add proper error handling to make code more robust');
    }
    
    return suggestions;
  }
}

export default JavaScriptAnalyzer;
