/**
 * Multi-Language Code Visualizer Service
 * Supports: JavaScript, Python, Java, C++, Go
 * 
 * Features:
 * - Step-by-step execution visualization
 * - Memory tracking (stack/heap)
 * - Call stack visualization
 * - Variable lifecycle tracking
 */

const JavaScriptParser = require('./parsers/javascript');
const PythonParser = require('./parsers/python');
const JavaParser = require('./parsers/java');
const CppParser = require('./parsers/cpp');
const GoParser = require('./parsers/go');

class VisualizerService {
  constructor() {
    this.parsers = {
      javascript: new JavaScriptParser(),
      python: new PythonParser(),
      java: new JavaParser(),
      cpp: new CppParser(),
      go: new GoParser()
    };
    
    // Aliases for language names
    this.aliases = {
      js: 'javascript',
      py: 'python',
      'c++': 'cpp',
      golang: 'go'
    };
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return Object.keys(this.parsers);
  }

  /**
   * Check if a language is supported
   */
  isSupported(language) {
    const normalizedLang = this.normalizeLanguage(language);
    return normalizedLang in this.parsers;
  }

  /**
   * Normalize language name (handle aliases)
   */
  normalizeLanguage(language) {
    const lower = language.toLowerCase();
    return this.aliases[lower] || lower;
  }

  /**
   * Visualize code execution
   * @param {string} code - Source code to visualize
   * @param {string} language - Programming language
   * @returns {Object} Visualization result with steps, memory, etc.
   */
  visualize(code, language) {
    const normalizedLang = this.normalizeLanguage(language);
    
    if (!this.isSupported(normalizedLang)) {
      throw new Error(`Language '${language}' is not supported. Supported: ${this.getSupportedLanguages().join(', ')}`);
    }

    if (!code || code.trim().length === 0) {
      throw new Error('Code cannot be empty');
    }

    // Get the appropriate parser
    const parser = this.getParser(normalizedLang);
    
    // Parse and generate visualization
    const result = parser.parse(code);
    
    return {
      ...result,
      metadata: {
        language: normalizedLang,
        codeLength: code.length,
        lineCount: code.split('\n').length,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Get a fresh parser instance for a language
   */
  getParser(language) {
    const ParserClass = {
      javascript: JavaScriptParser,
      python: PythonParser,
      java: JavaParser,
      cpp: CppParser,
      go: GoParser
    }[language];

    return new ParserClass();
  }
}

// Export singleton instance
module.exports = new VisualizerService();
