import { logger } from '../logger.js';
import crypto from 'crypto';

/**
 * Registry for managing analyzer plugins
 */
class AnalyzerRegistry {
  constructor() {
    this.analyzers = new Map();
    this.cache = new Map();
    this.cacheTimeout = 3600000; // 1 hour
  }

  /**
   * Register a new analyzer plugin
   */
  register(analyzer) {
    if (!analyzer || !analyzer.name) {
      throw new Error('Invalid analyzer: must have a name');
    }

    this.analyzers.set(analyzer.name, analyzer);
    logger.info(`Analyzer registered: ${analyzer.name} v${analyzer.version}`);
  }

  /**
   * Unregister an analyzer
   */
  unregister(name) {
    const removed = this.analyzers.delete(name);
    if (removed) {
      logger.info(`Analyzer unregistered: ${name}`);
    }
    return removed;
  }

  /**
   * Get analyzer by name
   */
  get(name) {
    return this.analyzers.get(name);
  }

  /**
   * Get all analyzers supporting a language
   */
  getForLanguage(language) {
    const matching = [];
    for (const [name, analyzer] of this.analyzers.entries()) {
      if (analyzer.enabled && analyzer.supportsLanguage(language)) {
        matching.push(analyzer);
      }
    }
    return matching;
  }

  /**
   * Get all registered analyzers
   */
  getAll() {
    return Array.from(this.analyzers.values());
  }

  /**
   * Get analyzer metadata
   */
  getMetadata() {
    const metadata = [];
    for (const analyzer of this.analyzers.values()) {
      metadata.push(analyzer.getMetadata());
    }
    return metadata;
  }

  /**
   * Run multiple analyzers on code
   */
  async runAnalyzers(code, language, analyzerNames = null, options = {}) {
    const analyzersToRun = analyzerNames 
      ? analyzerNames.map(name => this.get(name)).filter(a => a && a.enabled)
      : this.getForLanguage(language);

    if (analyzersToRun.length === 0) {
      return {
        language,
        analyzers: [],
        issues: [],
        score: 100,
        message: `No analyzers available for ${language}`
      };
    }

    const results = await Promise.allSettled(
      analyzersToRun.map(async analyzer => {
        try {
          const startTime = Date.now();
          const result = await Promise.race([
            analyzer.analyze(code, language, options),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Analyzer timeout')), analyzer.timeout)
            )
          ]);

          return {
            analyzer: analyzer.name,
            version: analyzer.version,
            executionTime: Date.now() - startTime,
            ...result
          };
        } catch (error) {
          logger.error(`Analyzer ${analyzer.name} failed`, { error: error.message });
          return {
            analyzer: analyzer.name,
            version: analyzer.version,
            error: error.message,
            issues: []
          };
        }
      })
    );

    const allIssues = [];
    const analyzerResults = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const data = result.value;
        analyzerResults.push(data);
        if (data.issues) {
          allIssues.push(...data.issues.map(issue => ({
            ...issue,
            source: data.analyzer
          })));
        }
      }
    });

    // Calculate overall score
    const scores = analyzerResults
      .filter(r => r.score !== undefined)
      .map(r => r.score);
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 100;

    return {
      language,
      analyzers: analyzerResults,
      issues: allIssues,
      score: avgScore,
      totalIssues: allIssues.length
    };
  }

  /**
   * Get cached analysis result
   */
  getCached(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cached analysis result
   */
  setCached(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Clean old cache entries periodically
    if (this.cache.size > 1000) {
      const now = Date.now();
      for (const [key, value] of this.cache.entries()) {
        if (now - value.timestamp > this.cacheTimeout) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Generate cache key
   */
  generateCacheKey(code, language, analyzers) {
    const analyzerStr = analyzers ? analyzers.sort().join(',') : 'all';
    return crypto
      .createHash('md5')
      .update(`${language}:${analyzerStr}:${code}`)
      .digest('hex');
  }
}

// Singleton instance
const registry = new AnalyzerRegistry();

export default registry;
