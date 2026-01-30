import React, { useState, useEffect } from 'react';
import '../Style/Visualizer.css';

const Visualizer = () => {
  const [code, setCode] = useState(`# Example: Bubble Sort
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n-i-1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

data = [64, 34, 25, 12, 22, 11, 90]
result = bubble_sort(data)
print(result)`);
  const [language, setLanguage] = useState('python');
  const [languages, setLanguages] = useState(['python', 'javascript', 'java', 'cpp']);
  const [visualization, setVisualization] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Auto-load sample visualization
    loadSampleVisualization();
  }, []);

  const loadSampleVisualization = () => {
    setVisualization({
      steps: [
        { 
          line: 1, 
          variables: { arr: [64, 34, 25, 12, 22], n: 5, i: 0 }, 
          highlight: [0, 1],
          description: 'Initialize array and get length' 
        },
        { 
          line: 3, 
          variables: { arr: [64, 34, 25, 12, 22], n: 5, i: 0, j: 0 }, 
          highlight: [0, 1],
          description: 'Start outer loop, i = 0' 
        },
        { 
          line: 4, 
          variables: { arr: [34, 64, 25, 12, 22], n: 5, i: 0, j: 1 }, 
          highlight: [0, 1],
          description: 'Compare arr[0] and arr[1], swap 64 > 34' 
        },
        { 
          line: 4, 
          variables: { arr: [34, 25, 64, 12, 22], n: 5, i: 0, j: 2 }, 
          highlight: [1, 2],
          description: 'Compare arr[1] and arr[2], swap 64 > 25' 
        },
        { 
          line: 4, 
          variables: { arr: [34, 25, 12, 64, 22], n: 5, i: 0, j: 3 }, 
          highlight: [2, 3],
          description: 'Compare arr[2] and arr[3], swap 64 > 12' 
        }
      ],
      finalArray: [12, 22, 25, 34, 64]
    });
    setCurrentStep(0);
  };

  const visualizeCode = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/visualizer/visualize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      const data = await response.json();
      setVisualization(data);
      setCurrentStep(0);
    } catch (error) {
      loadSampleVisualization();
    }
    setLoading(false);
  };

  const playVisualization = () => {
    if (!visualization) {
return;
}
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= visualization.steps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const currentStepData = visualization?.steps[currentStep];

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <h1>🎯 Code Visualizer</h1>
        <p>Watch your code execute step by step</p>
      </div>
      
      <div className="visualizer-main">
        <div className="code-panel">
          <div className="panel-header">
            <h3>📝 Your Code</h3>
            <div className="controls">
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang.toUpperCase()}</option>
                ))}
              </select>
              <button onClick={visualizeCode} disabled={loading} className="btn-primary">
                {loading ? '⏳ Processing...' : '🚀 Visualize'}
              </button>
            </div>
          </div>
          
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="code-editor"
            rows={15}
          />
        </div>

        <div className="visualization-panel">
          {visualization && (
            <>
              <div className="panel-header">
                <h3>🎬 Execution Steps</h3>
                <div className="playback-controls">
                  <button 
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="btn-control"
                  >
                    ⏮️
                  </button>
                  <button 
                    onClick={playVisualization}
                    disabled={isPlaying}
                    className="btn-play"
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </button>
                  <button 
                    onClick={() => setCurrentStep(Math.min(visualization.steps.length - 1, currentStep + 1))}
                    disabled={currentStep === visualization.steps.length - 1}
                    className="btn-control"
                  >
                    ⏭️
                  </button>
                  <span className="step-counter">
                    {currentStep + 1} / {visualization.steps.length}
                  </span>
                </div>
              </div>

              <div className="step-display">
                <div className="current-step">
                  <h4>📍 Line {currentStepData?.line}</h4>
                  <p>{currentStepData?.description}</p>
                </div>

                <div className="array-visualization">
                  <h4>📊 Array State</h4>
                  <div className="array-container">
                    {currentStepData?.variables.arr?.map((value, index) => (
                      <div 
                        key={index} 
                        className={`array-item ${
                          currentStepData.highlight?.includes(index) ? 'highlighted' : ''
                        }`}
                      >
                        <div className="array-value">{value}</div>
                        <div className="array-index">{index}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="variables-display">
                  <h4>🔢 Variables</h4>
                  <div className="variables-grid">
                    {Object.entries(currentStepData?.variables || {}).map(([name, value]) => (
                      name !== 'arr' && (
                        <div key={name} className="variable-card">
                          <span className="var-name">{name}</span>
                          <span className="var-value">{JSON.stringify(value)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Visualizer;