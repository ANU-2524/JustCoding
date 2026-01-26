import React, { useState } from 'react';
import { FaBug, FaCode, FaRobot, FaLightbulb, FaSpinner } from 'react-icons/fa';
import '../Style/DebugHelper.css';

const DebugHelper = () => {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [debugResult, setDebugResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' }
  ];

  const sampleProblems = [
    {
      title: 'Undefined Variable Error',
      code: `function calculateSum(a, b) {
  let result = a + b;
  console.log(total); // Error: total is not defined
  return result;
}`,
      error: 'ReferenceError: total is not defined'
    },
    {
      title: 'Array Index Out of Bounds',
      code: `let numbers = [1, 2, 3];
for (let i = 0; i <= numbers.length; i++) {
  console.log(numbers[i]); // Error: undefined at index 3
}`,
      error: 'TypeError: Cannot read property of undefined'
    },
    {
      title: 'Infinite Loop',
      code: `let i = 0;
while (i < 10) {
  console.log(i);
  // Missing i++ causes infinite loop
}`,
      error: 'Script timeout - infinite loop detected'
    }
  ];

  const handleDebug = async () => {
    if (!code.trim()) {
      alert('Please enter some code to debug');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/gpt/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          errorMessage: errorMessage
        }),
      });

      const data = await response.json();
      
      if (data.debugHelp) {
        setDebugResult(data.debugHelp);
      } else {
        setDebugResult('Sorry, I couldn\'t analyze your code. Please try again.');
      }
    } catch (error) {
      console.error('Debug error:', error);
      setDebugResult('Error connecting to debug service. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample) => {
    setCode(sample.code);
    setErrorMessage(sample.error);
    setDebugResult('');
  };

  const clearAll = () => {
    setCode('');
    setErrorMessage('');
    setDebugResult('');
  };

  return (
    <div className="debug-helper">
      <div className="debug-header">
        <h1><FaBug /> AI Debug Helper</h1>
        <p>Get AI-powered assistance to debug your code and fix errors</p>
      </div>

      <div className="debug-content">
        <div className="debug-input-section">
          <div className="section-header">
            <h2><FaCode /> Your Code</h2>
            <div className="controls">
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="language-select"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <button onClick={clearAll} className="clear-btn">
                Clear All
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste your code here..."
            className="code-input"
            rows="12"
          />

          <div className="error-section">
            <h3>Error Message (Optional)</h3>
            <textarea
              value={errorMessage}
              onChange={(e) => setErrorMessage(e.target.value)}
              placeholder="Paste any error messages here..."
              className="error-input"
              rows="3"
            />
          </div>

          <button 
            onClick={handleDebug}
            disabled={loading || !code.trim()}
            className="debug-btn"
          >
            {loading ? (
              <>
                <FaSpinner className="spinning" /> Analyzing...
              </>
            ) : (
              <>
                <FaRobot /> Debug My Code
              </>
            )}
          </button>
        </div>

        <div className="debug-output-section">
          <div className="section-header">
            <h2><FaLightbulb /> AI Analysis</h2>
          </div>

          {debugResult ? (
            <div className="debug-result">
              <div className="result-content">
                {debugResult.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          ) : (
            <div className="debug-placeholder">
              <FaRobot className="placeholder-icon" />
              <h3>Ready to help!</h3>
              <p>Paste your code and click "Debug My Code" to get AI-powered debugging assistance.</p>
            </div>
          )}
        </div>
      </div>

      <div className="sample-problems">
        <h2>Try Sample Problems</h2>
        <div className="samples-grid">
          {sampleProblems.map((sample, index) => (
            <div key={index} className="sample-card">
              <h3>{sample.title}</h3>
              <pre className="sample-code">{sample.code.substring(0, 100)}...</pre>
              <button 
                onClick={() => loadSample(sample)}
                className="load-sample-btn"
              >
                Load Sample
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="debug-tips">
        <h2>Debugging Tips</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <FaBug className="tip-icon" />
            <h3>Include Error Messages</h3>
            <p>Always paste the complete error message for better analysis</p>
          </div>
          <div className="tip-card">
            <FaCode className="tip-icon" />
            <h3>Provide Context</h3>
            <p>Include relevant code sections, not just the problematic line</p>
          </div>
          <div className="tip-card">
            <FaLightbulb className="tip-icon" />
            <h3>Be Specific</h3>
            <p>Describe what you expected vs what actually happened</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugHelper;