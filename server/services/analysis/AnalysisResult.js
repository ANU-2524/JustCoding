/**
 * Analysis Result Object for Analyzer Plugins
 * Simple object used by analyzers to structure their results
 */
class AnalysisResult {
  constructor(analyzerName, analyzerVersion) {
    this.analyzerName = analyzerName;
    this.analyzerVersion = analyzerVersion;
    this.issues = [];
    this.metrics = {};
    this.suggestions = [];
    this.score = null;
    this.executionTime = 0;
  }

  addIssue(issue) {
    this.issues.push({
      line: issue.line || 1,
      column: issue.column || 1,
      endLine: issue.endLine || issue.line || 1,
      endColumn: issue.endColumn || issue.column || 1,
      message: issue.message,
      severity: issue.severity || 'warning', // error, warning, info
      category: issue.category || 'bug',
      ruleId: issue.ruleId || 'unknown'
    });
  }

  addSuggestion(suggestion) {
    this.suggestions.push(suggestion);
  }

  setMetrics(metrics) {
    this.metrics = metrics;
  }

  setScore(score) {
    this.score = Math.max(0, Math.min(100, score));
  }
}

export default AnalysisResult;
