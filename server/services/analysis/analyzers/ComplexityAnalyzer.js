const { AnalyzerPlugin, AnalysisResult } = require('../AnalyzerPlugin');

class ComplexityAnalyzer extends AnalyzerPlugin {
  constructor() {
    super('Complexity', '1.0.0', ['javascript', 'python', 'java', 'cpp', 'go', 'c', 'ruby', 'php']);
  }

  async analyze(code, language, options = {}) {
    const result = new AnalysisResult(this.name, this.version);
    const startTime = Date.now();

    const metrics = this.calculateMetrics(code, language);
    result.setMetrics(metrics);

    // Add issues for high complexity
    if (metrics.cyclomaticComplexity > 10) {
      result.addIssue({
        line: 1,
        column: 1,
        message: `High cyclomatic complexity (${metrics.cyclomaticComplexity}). Consider refactoring.`,
        severity: 'warning',
        category: 'smell',
        ruleId: 'complexity/cyclomatic'
      });
    }

    if (metrics.cognitiveComplexity > 15) {
      result.addIssue({
        line: 1,
        column: 1,
        message: `High cognitive complexity (${metrics.cognitiveComplexity}). Hard to understand.`,
        severity: 'warning',
        category: 'smell',
        ruleId: 'complexity/cognitive'
      });
    }

    if (metrics.linesOfCode > 300) {
      result.addIssue({
        line: 1,
        column: 1,
        message: 'File too long (${metrics.linesOfCode} lines). Consider splitting.',
        severity: 'info',
        category: 'smell',
        ruleId: 'complexity/file-length'
      });
    }

    // Calculate score
    let score = 100;
    score -= Math.min(30, metrics.cyclomaticComplexity * 2);
    score -= Math.min(30, metrics.cognitiveComplexity);
    score -= Math.min(20, Math.floor(metrics.linesOfCode / 20));
    result.setScore(Math.max(0, score));

    result.executionTime = Date.now() - startTime;
    return result;
  }

  calculateMetrics(code, language) {
    const lines = code.split('\n');
    const linesOfCode = lines.filter(l => l.trim() && !l.trim().startsWith('//')).length;
    
    // Cyclomatic complexity - count decision points
    const decisionPoints = [
      /\bif\b/g, /\belse\s+if\b/g, /\bfor\b/g, /\bwhile\b/g, 
      /\bcase\b/g, /\bcatch\b/g, /\b&&\b/g, /\b\|\|\b/g, /\?\s*.*\s*:/g
    ];
    
    let cyclomaticComplexity = 1; // Start at 1
    decisionPoints.forEach(regex => {
      const matches = code.match(regex);
      if (matches) cyclomaticComplexity += matches.length;
    });

    // Cognitive complexity - nested structures weight more
    const nesting = this.calculateNesting(code);
    const cognitiveComplexity = Math.floor(cyclomaticComplexity * (1 + nesting * 0.2));

    // Count functions
    const functionMatches = code.match(/function\s+\w+|def\s+\w+|func\s+\w+|public\s+\w+\s+\w+\(/g);
    const functionCount = functionMatches ? functionMatches.length : 0;

    return {
      linesOfCode,
      cyclomaticComplexity,
      cognitiveComplexity,
      nestingDepth: nesting,
      functionCount,
      averageFunctionLength: functionCount > 0 ? Math.floor(linesOfCode / functionCount) : linesOfCode
    };
  }

  calculateNesting(code) {
    let maxNesting = 0;
    let currentNesting = 0;
    
    for (const char of code) {
      if (char === '{') {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      } else if (char === '}') {
        currentNesting = Math.max(0, currentNesting - 1);
      }
    }
    
    return maxNesting;
  }
}

module.exports = ComplexityAnalyzer;
