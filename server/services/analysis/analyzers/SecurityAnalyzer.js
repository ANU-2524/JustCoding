import AnalyzerPlugin from '../AnalyzerPlugin.js';
import AnalysisResult from '../AnalysisResult.js';

class SecurityAnalyzer extends AnalyzerPlugin {
  constructor() {
    super('Security', '1.0.0', ['javascript', 'python', 'java', 'cpp', 'go']);
    
    this.patterns = {
      javascript: [
        { regex: /eval\s*\(/g, message: 'Avoid eval() - security risk', severity: 'error', category: 'security' },
        { regex: /innerHTML\s*=/g, message: 'innerHTML can lead to XSS', severity: 'warning', category: 'security' },
        { regex: /document\.write/g, message: 'document.write can be unsafe', severity: 'warning', category: 'security' },
        { regex: /dangerouslySetInnerHTML/g, message: 'Potential XSS vulnerability', severity: 'warning', category: 'security' }
      ],
      python: [
        { regex: /eval\s*\(/g, message: 'Avoid eval() - security risk', severity: 'error', category: 'security' },
        { regex: /exec\s*\(/g, message: 'exec() is dangerous', severity: 'error', category: 'security' },
        { regex: /pickle\.loads/g, message: 'pickle.loads can execute arbitrary code', severity: 'error', category: 'security' },
        { regex: /input\s*\(/g, message: 'Validate user input', severity: 'warning', category: 'security' },
        { regex: /os\.system/g, message: 'os.system can be unsafe', severity: 'warning', category: 'security' }
      ],
      java: [
        { regex: /Runtime\.getRuntime\(\)\.exec/g, message: 'Runtime.exec can be unsafe', severity: 'warning', category: 'security' },
        { regex: /ProcessBuilder/g, message: 'Validate ProcessBuilder arguments', severity: 'warning', category: 'security' },
        { regex: /\.executeQuery\(/g, message: 'Potential SQL injection', severity: 'error', category: 'security' }
      ],
      cpp: [
        { regex: /gets\s*\(/g, message: 'gets() is unsafe - buffer overflow', severity: 'error', category: 'security' },
        { regex: /strcpy\s*\(/g, message: 'strcpy can cause buffer overflow', severity: 'warning', category: 'security' },
        { regex: /sprintf\s*\(/g, message: 'sprintf is unsafe - use snprintf', severity: 'warning', category: 'security' }
      ],
      go: [
        { regex: /exec\.Command/g, message: 'Validate exec.Command arguments', severity: 'warning', category: 'security' },
        { regex: /template\.HTML/g, message: 'Potential XSS vulnerability', severity: 'warning', category: 'security' }
      ]
    };
  }

  async analyze(code, language, options = {}) {
    const result = new AnalysisResult(this.name, this.version);
    const startTime = Date.now();

    const patterns = this.patterns[language] || [];
    const lines = code.split('\n');

    patterns.forEach(pattern => {
      lines.forEach((line, index) => {
        if (pattern.regex.test(line)) {
          const match = line.match(pattern.regex);
          const column = line.indexOf(match[0]) + 1;
          
          result.addIssue({
            line: index + 1,
            column,
            message: pattern.message,
            severity: pattern.severity,
            category: pattern.category,
            ruleId: `security/${pattern.regex.source.substring(0, 20)}`
          });
        }
      });
    });

    // Metrics
    const critical = result.issues.filter(i => i.severity === 'error').length;
    const warnings = result.issues.filter(i => i.severity === 'warning').length;
    
    result.setMetrics({
      securityIssues: result.issues.length,
      critical,
      warnings
    });

    // Score
    const score = Math.max(0, 100 - (critical * 20) - (warnings * 5));
    result.setScore(score);

    result.executionTime = Date.now() - startTime;
    return result;
  }
}

export default SecurityAnalyzer;
