import React, { useState } from 'react';
import { FaExclamationTriangle, FaExclamationCircle, FaChevronDown, FaChevronUp, FaWrench } from 'react-icons/fa';
import '../Style/QualityFeedback.css';

const QualityFeedback = ({ issues, onFixAll, isFixing, onJumpToLine }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const errors = issues.filter(issue => issue.severity === 'error');
  const warnings = issues.filter(issue => issue.severity === 'warning');
  
  const getSeverityIcon = (severity) => {
    return severity === 'error' ? 
      <FaExclamationCircle className="severity-icon error" /> : 
      <FaExclamationTriangle className="severity-icon warning" />;
  };

  const handleJumpToLine = (line) => {
    if (onJumpToLine) {
      onJumpToLine(line);
    }
  };

  if (issues.length === 0) {
    return (
      <div className="quality-feedback no-issues">
        <div className="feedback-header">
          <h3>✅ Code Quality</h3>
          <span className="status-badge success">No Issues</span>
        </div>
      </div>
    );
  }

  return (
    <div className="quality-feedback">
      <div className="feedback-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h3>🔍 Code Quality</h3>
        <div className="header-controls">
          <div className="issue-counts">
            {errors.length > 0 && (
              <span className="count-badge error">{errors.length} errors</span>
            )}
            {warnings.length > 0 && (
              <span className="count-badge warning">{warnings.length} warnings</span>
            )}
          </div>
          {onFixAll && issues.some(issue => issue.ruleId) && (
            <button 
              className="fix-all-btn" 
              onClick={(e) => {
                e.stopPropagation();
                onFixAll();
              }}
              disabled={isFixing}
            >
              <FaWrench /> {isFixing ? 'Fixing...' : 'Fix All'}
            </button>
          )}
          <button className="collapse-btn">
            {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="feedback-content">
          {errors.length > 0 && (
            <div className="issue-section">
              <h4 className="section-title error">Errors ({errors.length})</h4>
              {errors.map((issue, index) => (
                <div 
                  key={`error-${index}`} 
                  className="issue-item error"
                  onClick={() => handleJumpToLine(issue.line)}
                >
                  {getSeverityIcon(issue.severity)}
                  <div className="issue-details">
                    <div className="issue-message">{issue.message}</div>
                    <div className="issue-meta">
                      <span className="line-info">Line {issue.line}:{issue.column}</span>
                      {issue.ruleId && <span className="rule-id">{issue.ruleId}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {warnings.length > 0 && (
            <div className="issue-section">
              <h4 className="section-title warning">Warnings ({warnings.length})</h4>
              {warnings.map((issue, index) => (
                <div 
                  key={`warning-${index}`} 
                  className="issue-item warning"
                  onClick={() => handleJumpToLine(issue.line)}
                >
                  {getSeverityIcon(issue.severity)}
                  <div className="issue-details">
                    <div className="issue-message">{issue.message}</div>
                    <div className="issue-meta">
                      <span className="line-info">Line {issue.line}:{issue.column}</span>
                      {issue.ruleId && <span className="rule-id">{issue.ruleId}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QualityFeedback;