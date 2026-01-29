/**
 * Analyzer Registry - Plugin-based code quality analyzer system
 * Manages registration, versioning, and execution of code analyzers
 */

class AnalyzerRegistry {
  constructor() {
    this.analyzers = new Map(); // language -> array of analyzers
    this.versions = new Map(); // analyzer ID -> version
  }

  /**
   * Register a new analyzer plugin
   */
  register(analyzer) {
    if (!analyzer.id || !analyzer.name || !analyzer.analyze) {
      throw new Error('Invalid analyzer: must have id, name, and analyze method');
    }

    if (!analyzer.supportedLanguages || !Array.isArray(analyzer.supportedLanguages)) {
      throw new Error('Analyzer must specify supportedLanguages array');
    }

    // Register for each supported language
    analyzer.supportedLanguages.forEach(lang => {
      if (!this.analyzers.has(lang)) {
        this.analyzers.set(lang, []);
      }
      this.analyzers.get(lang).push(analyzer);
    });

    // Store version
    this.versions.set(analyzer.id, analyzer.version || '1.0.0');

    console.log(`✅ Registered analyzer: ${analyzer.name} v${analyzer.version} for ${analyzer.supportedLanguages.join(', ')}`);
  }

  /**
   * Get all analyzers for a specific language
   */
  getAnalyzers(language) {
    return this.analyzers.get(language) || [];
  }

  /**
   * Get analyzer by ID
   */
  getAnalyzerById(analyzerId) {
    for (const analyzers of this.analyzers.values()) {
      const analyzer = analyzers.find(a => a.id === analyzerId);
      if (analyzer) return analyzer;
    }
    return null;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return Array.from(this.analyzers.keys());
  }

  /**
   * Get analyzer metadata
   */
  getMetadata() {
    const metadata = [];
    const processed = new Set();

    for (const analyzers of this.analyzers.values()) {
      for (const analyzer of analyzers) {
        if (!processed.has(analyzer.id)) {
          metadata.push({
            id: analyzer.id,
            name: analyzer.name,
            version: this.versions.get(analyzer.id),
            description: analyzer.description || '',
            supportedLanguages: analyzer.supportedLanguages,
            categories: analyzer.categories || [],
            enabled: analyzer.enabled !== false
          });
          processed.add(analyzer.id);
        }
      }
    }

    return metadata;
  }

  /**
   * Analyze code using all applicable analyzers
   */
  async analyzeCode(code, language, options = {}) {
    const analyzers = this.getAnalyzers(language);
    
    if (analyzers.length === 0) {
      return {
        language,
        supported: false,
        message: `No analyzers available for ${language}`,
        results: []
      };
    }

    const results = [];
    const errors = [];

    // Run analyzers in parallel
    const promises = analyzers
      .filter(a => a.enabled !== false)
      .map(async analyzer => {
        try {
          const startTime = Date.now();
          const result = await Promise.race([
            analyzer.analyze(code, options),
            this.timeout(30000) // 30 second timeout
          ]);

          return {
            analyzerId: analyzer.id,
            analyzerName: analyzer.name,
            version: this.versions.get(analyzer.id),
            executionTime: Date.now() - startTime,
            success: true,
            ...result
          };
        } catch (error) {
          errors.push({
            analyzerId: analyzer.id,
            analyzerName: analyzer.name,
            error: error.message
          });
          return null;
        }
      });

    const analysisResults = await Promise.all(promises);
    results.push(...analysisResults.filter(r => r !== null));

    return {
      language,
      supported: true,
      analyzersUsed: results.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Helper to create timeout promise
   */
  timeout(ms) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Analysis timeout')), ms)
    );
  }

  /**
   * Aggregate scores from multiple analyzers
   */
  aggregateScores(analysisResults) {
    if (!analysisResults.results || analysisResults.results.length === 0) {
      return { overall: 0, breakdown: {} };
    }

    const scores = analysisResults.results
      .filter(r => r.score !== undefined)
      .map(r => ({
        score: r.score,
        weight: r.weight || 1
      }));

    if (scores.length === 0) {
      return { overall: 0, breakdown: {} };
    }

    const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
    const overall = scores.reduce((sum, s) => sum + (s.score * s.weight), 0) / totalWeight;

    const breakdown = {};
    analysisResults.results.forEach(r => {
      if (r.score !== undefined) {
        breakdown[r.analyzerId] = {
          name: r.analyzerName,
          score: r.score,
          weight: r.weight || 1
        };
      }
    });

    return {
      overall: Math.round(overall * 100) / 100,
      breakdown
    };
  }

  /**
   * Get all issues from analysis results
   */
  getAllIssues(analysisResults) {
    const allIssues = [];
    
    if (analysisResults.results) {
      analysisResults.results.forEach(result => {
        if (result.issues && Array.isArray(result.issues)) {
          result.issues.forEach(issue => {
            allIssues.push({
              ...issue,
              source: result.analyzerName,
              analyzerId: result.analyzerId
            });
          });
        }
      });
    }

    // Sort by severity and line number
    const severityOrder = { 'critical': 0, 'error': 1, 'warning': 2, 'info': 3 };
    allIssues.sort((a, b) => {
      const severityDiff = (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3);
      if (severityDiff !== 0) return severityDiff;
      return (a.line || 0) - (b.line || 0);
    });

    return allIssues;
  }

  /**
   * Get suggestions from all analyzers
   */
  getAllSuggestions(analysisResults) {
    const suggestions = [];
    
    if (analysisResults.results) {
      analysisResults.results.forEach(result => {
        if (result.suggestions && Array.isArray(result.suggestions)) {
          result.suggestions.forEach(suggestion => {
            suggestions.push({
              ...suggestion,
              source: result.analyzerName,
              analyzerId: result.analyzerId
            });
          });
        }
      });
    }

    return suggestions;
  }
}

// Singleton instance
const registry = new AnalyzerRegistry();

module.exports = registry;
