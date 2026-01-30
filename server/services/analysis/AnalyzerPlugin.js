/**
 * Base Analyzer Plugin Interface
 * All analyzers must extend this class
 */
class AnalyzerPlugin {
  constructor(config = {}) {
    this.name = config.name || 'BaseAnalyzer';
    this.version = config.version || '1.0.0';
    this.supportedLanguages = config.supportedLanguages || [];
    this.timeout = config.timeout || 30000;
    this.enabled = config.enabled !== false;
  }

  /**
   * Analyze code and return issues
   * @param {string} code - Code to analyze
   * @param {string} language - Programming language
   * @param {object} options - Additional options
   * @returns {Promise<object>} Analysis result
   */
  async analyze(code, language, options = {}) {
    throw new Error('analyze() must be implemented by analyzer plugin');
  }

  /**
   * Check if this analyzer supports the given language
   */
  supportsLanguage(language) {
    return this.supportedLanguages.includes(language);
  }

  /**
   * Get analyzer metadata
   */
  getMetadata() {
    return {
      name: this.name,
      version: this.version,
      supportedLanguages: this.supportedLanguages,
      enabled: this.enabled
    };
  }

  /**
   * Calculate severity score (0-100)
   */
  calculateScore(issues) {
    if (!issues || issues.length === 0) return 100;

    let deductions = 0;
    issues.forEach(issue => {
      if (issue.severity === 'error' || issue.severity === 'critical') deductions += 10;
      else if (issue.severity === 'warning') deductions += 5;
      else if (issue.severity === 'info') deductions += 2;
    });

    return Math.max(0, 100 - deductions);
  }
}

export default AnalyzerPlugin;
