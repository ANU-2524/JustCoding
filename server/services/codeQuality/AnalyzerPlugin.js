/**
 * Base class for all code quality analyzer plugins
 * Provides common interface and functionality for extensible analyzers
 */
class AnalyzerPlugin {
  constructor(config = {}) {
    this.name = config.name || 'BaseAnalyzer';
    this.version = config.version || '1.0.0';
    this.supportedLanguages = config.supportedLanguages || [];
    this.enabled = config.enabled !== undefined ? config.enabled : true;
    this.timeout = config.timeout || 30000; // 30 seconds default
    this.priority = config.priority || 0; // Higher priority runs first
  }

  /**
   * Check if this analyzer supports the given language
   */
  supportsLanguage(language) {
    return this.supportedLanguages.includes(language);
  }

  /**
   * Main analysis method - must be implemented by subclasses
   * @param {Object} options - Analysis options
   * @param {string} options.code - Code to analyze
   * @param {string} options.language - Programming language
   * @param {Object} options.context - Additional context (userId, challengeId, etc)
   * @returns {Promise<AnalysisResult>}
   */
  async analyze(options) {
    throw new Error('analyze() must be implemented by subclass');
  }

  /**
   * Validate code before analysis
   */
  validateInput(code, language) {
    if (!code || typeof code !== 'string') {
      throw new Error('Code must be a non-empty string');
    }

    if (code.length > 50000) {
      throw new Error('Code too long. Maximum 50,000 characters allowed.');
    }

    if (!this.supportsLanguage(language)) {
      throw new Error(`Language ${language} not supported by ${this.name}`);
    }

    return true;
  }

  /**
   * Get metadata about this analyzer
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      supportedLanguages: this.supportedLanguages,
      enabled: this.enabled,
      priority: this.priority
    };
  }

  /**
   * Transform analysis results to common format
   */
  formatResult(rawResults, metadata = {}) {
    return {
      analyzer: this.name,
      version: this.version,
      timestamp: new Date().toISOString(),
      ...rawResults,
      metadata: {
        ...metadata,
        executionTime: metadata.executionTime || 0
      }
    };
  }

  /**
   * Calculate overall quality score (0-100)
   */
  calculateScore(issues) {
    if (!issues || issues.length === 0) {
      return 100;
    }

    const weights = {
      critical: 20,
      error: 10,
      warning: 5,
      info: 1
    };

    const totalDeduction = issues.reduce((sum, issue) => {
      const severity = issue.severity || 'info';
      return sum + (weights[severity] || 1);
    }, 0);

    const score = Math.max(0, 100 - totalDeduction);
    return Math.round(score);
  }

  /**
   * Categorize issues by type
   */
  categorizeIssues(issues) {
    const categories = {
      security: [],
      performance: [],
      style: [],
      bugs: [],
      complexity: [],
      other: []
    };

    issues.forEach(issue => {
      const category = issue.category || 'other';
      if (categories[category]) {
        categories[category].push(issue);
      } else {
        categories.other.push(issue);
      }
    });

    return categories;
  }

  /**
   * Get severity counts
   */
  getSeverityCounts(issues) {
    const counts = {
      critical: 0,
      error: 0,
      warning: 0,
      info: 0
    };

    issues.forEach(issue => {
      const severity = issue.severity || 'info';
      if (counts[severity] !== undefined) {
        counts[severity]++;
      }
    });

    return counts;
  }
}

module.exports = AnalyzerPlugin;
