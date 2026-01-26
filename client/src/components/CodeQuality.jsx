import React, { useState } from 'react';
import '../Style/CodeQuality.css';

const CodeQuality = () => {
  const [code, setCode] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeCode = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/codeQuality/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
    setLoading(false);
  };

  const sampleAnalysis = {
    score: 85,
    issues: [
      { type: 'warning', line: 5, message: 'Variable could be const' },
      { type: 'error', line: 12, message: 'Missing semicolon' }
    ],
    metrics: {
      complexity: 3,
      maintainability: 78,
      duplications: 2
    }
  };

  return (
    <div className="code-quality-container">
      <h1>Code Quality Analysis</h1>
      
      <div className="analysis-section">
        <div className="code-input">
          <h3>Your Code</h3>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            rows={15}
          />
          <button onClick={analyzeCode} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Code'}
          </button>
        </div>

        <div className="results-panel">
          <h3>Analysis Results</h3>
          {analysis || sampleAnalysis ? (
            <div className="analysis-results">
              <div className="score-card">
                <h4>Quality Score</h4>
                <div className="score">{(analysis || sampleAnalysis).score}/100</div>
              </div>
              
              <div className="metrics">
                <h4>Metrics</h4>
                <div className="metric-item">
                  <span>Complexity:</span>
                  <span>{(analysis || sampleAnalysis).metrics.complexity}</span>
                </div>
                <div className="metric-item">
                  <span>Maintainability:</span>
                  <span>{(analysis || sampleAnalysis).metrics.maintainability}</span>
                </div>
              </div>

              <div className="issues">
                <h4>Issues Found</h4>
                {(analysis || sampleAnalysis).issues.map((issue, index) => (
                  <div key={index} className={`issue ${issue.type}`}>
                    <span className="line">Line {issue.line}:</span>
                    <span className="message">{issue.message}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>Run analysis to see results</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeQuality;