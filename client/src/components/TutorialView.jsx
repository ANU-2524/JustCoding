import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { 
  FaArrowLeft, 
  FaChevronLeft, 
  FaChevronRight, 
  FaPlay, 
  FaCheck, 
  FaClock, 
  FaStar,
  FaCode,
  FaLightbulb,
  FaQuestion,
  FaVideo,
  FaGraduationCap,
  FaTrophy,
  FaBookmark
} from 'react-icons/fa';
import CodeEditor from './CodeEditor';
import '../Style/TutorialView.css';

function TutorialView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tutorial, setTutorial] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHints, setShowHints] = useState(false);
  const [userCode, setUserCode] = useState('');
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const stepContentRef = useRef(null);

  useEffect(() => {
    if (slug) {
      fetchTutorial();
      if (currentUser) {
        fetchProgress();
      }
      setStartTime(Date.now());
    }
  }, [slug, currentUser]);

  useEffect(() => {
    // Auto-save progress every 30 seconds
    const interval = setInterval(() => {
      if (currentUser && startTime) {
        const sessionTime = Math.floor((Date.now() - startTime) / 1000 / 60); // minutes
        updateProgress({ timeSpent: (progress?.timeSpent || 0) + sessionTime });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentUser, startTime, progress]);

  const fetchTutorial = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tutorials/${slug}`);
      if (!response.ok) {
        throw new Error('Tutorial not found');
      }
      const data = await response.json();
      setTutorial(data);
      
      // Set starter code if available for current step
      if (data.steps && data.steps[0]?.interactive?.starterCode) {
        setUserCode(data.steps[0].interactive.starterCode);
      }
    } catch (error) {
      console.error('Error fetching tutorial:', error);
      navigate('/tutorials');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/tutorials/${slug}/progress`, {
        headers: {
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
        if (data.currentStep) {
          setCurrentStep(data.currentStep);
        }
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const updateProgress = async (updates) => {
    if (!currentUser) {
return;
}

    try {
      const response = await fetch(`/api/tutorials/${slug}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const updatedProgress = await response.json();
        setProgress(updatedProgress);
        return updatedProgress;
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const goToStep = (stepNumber) => {
    if (stepNumber < 1 || stepNumber > tutorial.steps.length) {
return;
}
    
    setCurrentStep(stepNumber);
    setShowHints(false);
    setQuizAnswer(null);
    setShowQuizResult(false);
    
    // Load starter code for interactive steps
    const step = tutorial.steps[stepNumber - 1];
    if (step?.interactive?.starterCode) {
      setUserCode(step.interactive.starterCode);
    }
    
    // Scroll to top of content
    if (stepContentRef.current) {
      stepContentRef.current.scrollTop = 0;
    }

    // Update progress
    if (currentUser) {
      updateProgress({ currentStep: stepNumber });
    }
  };

  const completeStep = () => {
    const currentStepData = getCurrentStep();
    
    // Validate code if interactive section is enabled
    if (currentStepData?.interactive?.enabled) {
      if (!userCode || userCode.trim() === '') {
        setValidationError('Please write some code to complete this step.');
        return;
      }
      
      // Check if code is only comments/whitespace
      const codeLines = userCode.split('\n');
      const hasActualCode = codeLines.some(line => {
        const trimmed = line.trim();
        return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*');
      });
      
      if (!hasActualCode) {
        setValidationError('Please write actual code (not just comments).');
        return;
      }
    }
    
    setValidationError(null);

    if (!currentUser) {
      // Allow guest users to navigate
      if (currentStep < tutorial.steps.length) {
        goToStep(currentStep + 1);
      }
      return;
    }

    const completedSteps = [...(progress?.completedSteps || [])];
    if (!completedSteps.includes(currentStep)) {
      completedSteps.push(currentStep);
    }

    updateProgress({ 
      completedSteps,
      currentStep: Math.min(currentStep + 1, tutorial.steps.length)
    });

    if (currentStep < tutorial.steps.length) {
      goToStep(currentStep + 1);
    }
  };

  const submitQuiz = () => {
    if (quizAnswer === null) {
return;
}
    
    setShowQuizResult(true);
    const isCorrect = quizAnswer === getCurrentStep().quiz.correctAnswer;
    
    if (isCorrect) {
      setTimeout(() => {
        completeStep();
      }, 2000);
    }
  };

  const getCurrentStep = () => {
    if (!tutorial || !tutorial.steps) {
return null;
}
    return tutorial.steps[currentStep - 1];
  };

  const isStepCompleted = (stepNumber) => {
    return progress?.completedSteps?.includes(stepNumber) || false;
  };

  const getProgressPercentage = () => {
    if (!tutorial || !progress) {
return 0;
}
    return Math.round((progress.completedSteps?.length || 0) / tutorial.steps.length * 100);
  };

  const formatCode = (code) => {
    // Simple code formatting
    return code.replace(/\\n/g, '\n').replace(/\\t/g, '  ');
  };

  if (loading) {
    return (
      <div className="tutorial-loading">
        <div className="loading-spinner"></div>
        <p>Loading tutorial...</p>
      </div>
    );
  }

  if (!tutorial) {
    return (
      <div className="tutorial-error">
        <h2>Tutorial not found</h2>
        <button onClick={() => navigate('/tutorials')} className="back-btn">
          <FaArrowLeft /> Back to Tutorials
        </button>
      </div>
    );
  }

  const currentStepData = getCurrentStep();

  return (
    <div className="tutorial-view">
      {/* Header */}
      <div className="tutorial-header">
        <div className="header-controls">
          <button onClick={() => navigate('/tutorials')} className="back-btn">
            <FaArrowLeft />
            <span>Back to Tutorials</span>
          </button>
          
          <div className="tutorial-info">
            <h1 className="tutorial-title">{tutorial.title}</h1>
            <div className="tutorial-meta">
              <span className="difficulty">{tutorial.difficulty}</span>
              <span className="duration">
                <FaClock /> {Math.floor(tutorial.estimatedDuration / 60)}h {tutorial.estimatedDuration % 60}m
              </span>
              <span className="rating">
                <FaStar /> {tutorial.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {currentUser && progress && (
          <div className="progress-header">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
            <span className="progress-text">
              {progress.completedSteps?.length || 0} / {tutorial.steps.length} steps
            </span>
          </div>
        )}
      </div>

      <div className="tutorial-body">
        {/* Sidebar */}
        <div className="tutorial-sidebar">
          <div className="steps-list">
            <h3>Steps</h3>
            {tutorial.steps.map((step, index) => (
              <button
                key={step.stepNumber}
                className={`step-item ${currentStep === step.stepNumber ? 'active' : ''} ${
                  isStepCompleted(step.stepNumber) ? 'completed' : ''
                }`}
                onClick={() => goToStep(step.stepNumber)}
              >
                <div className="step-number">
                  {isStepCompleted(step.stepNumber) ? <FaCheck /> : step.stepNumber}
                </div>
                <div className="step-info">
                  <div className="step-title">{step.title}</div>
                  <div className="step-type">
                    {step.interactive?.enabled && <FaCode />}
                    {step.videoUrl && <FaVideo />}
                    {step.quiz?.enabled && <FaQuestion />}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="tutorial-content" ref={stepContentRef}>
          {currentStepData && (
            <div className="step-content">
              <div className="step-header">
                <h2>{currentStepData.title}</h2>
                <div className="step-indicators">
                  <span className="step-count">
                    Step {currentStep} of {tutorial.steps.length}
                  </span>
                  {isStepCompleted(currentStep) && (
                    <span className="completed-badge">
                      <FaCheck /> Completed
                    </span>
                  )}
                </div>
              </div>

              <div className="step-body">
                {/* Video */}
                {currentStepData.videoUrl && (
                  <div className="video-section">
                    <iframe
                      src={currentStepData.videoUrl}
                      title={currentStepData.title}
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Text Content */}
                <div className="text-content">
                  <div dangerouslySetInnerHTML={{ __html: currentStepData.content }} />
                </div>

                {/* Code Example */}
                {currentStepData.codeExample?.code && (
                  <div className="code-example">
                    <h4>Code Example</h4>
                    <CodeEditor
                      value={formatCode(currentStepData.codeExample.code)}
                      language={currentStepData.codeExample.language || 'javascript'}
                      readOnly={true}
                      height="200px"
                    />
                    {currentStepData.codeExample.explanation && (
                      <div className="code-explanation">
                        <FaLightbulb className="explanation-icon" />
                        <p>{currentStepData.codeExample.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Interactive Section */}
                {currentStepData.interactive?.enabled && (
                  <div className="interactive-section">
                    <h4>Try it yourself</h4>
                    <p>{currentStepData.interactive.prompt}</p>
                    
                    <CodeEditor
                      value={userCode}
                      onChange={setUserCode}
                      language={currentStepData.codeExample?.language || 'javascript'}
                      height="300px"
                    />

                    {validationError && (
                      <div className="validation-error-message">
                        <span>{validationError}</span>
                        <button 
                          className="error-close-btn"
                          onClick={() => setValidationError(null)}
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {currentStepData.interactive.hints?.length > 0 && (
                      <div className="hints-section">
                        <button 
                          className="hints-toggle"
                          onClick={() => setShowHints(!showHints)}
                        >
                          <FaLightbulb />
                          {showHints ? 'Hide' : 'Show'} Hints
                        </button>
                        
                        {showHints && (
                          <div className="hints-list">
                            {currentStepData.interactive.hints.map((hint, index) => (
                              <div key={index} className="hint-item">
                                <FaLightbulb className="hint-icon" />
                                <span>{hint}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Quiz Section */}
                {currentStepData.quiz?.enabled && (
                  <div className="quiz-section">
                    <h4>Knowledge Check</h4>
                    <p className="quiz-question">{currentStepData.quiz.question}</p>
                    
                    <div className="quiz-options">
                      {currentStepData.quiz.options.map((option, index) => (
                        <button
                          key={index}
                          className={`quiz-option ${quizAnswer === index ? 'selected' : ''} ${
                            showQuizResult ? 
                              (index === currentStepData.quiz.correctAnswer ? 'correct' : 
                               quizAnswer === index ? 'incorrect' : '') : ''
                          }`}
                          onClick={() => !showQuizResult && setQuizAnswer(index)}
                          disabled={showQuizResult}
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {!showQuizResult && (
                      <button 
                        className="submit-quiz-btn"
                        onClick={submitQuiz}
                        disabled={quizAnswer === null}
                      >
                        Submit Answer
                      </button>
                    )}

                    {showQuizResult && (
                      <div className={`quiz-result ${quizAnswer === currentStepData.quiz.correctAnswer ? 'correct' : 'incorrect'}`}>
                        <p>
                          {quizAnswer === currentStepData.quiz.correctAnswer ? 
                            '✅ Correct!' : '❌ Incorrect'}
                        </p>
                        {currentStepData.quiz.explanation && (
                          <p className="quiz-explanation">{currentStepData.quiz.explanation}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation */}
                <div className="step-navigation">
                  <button 
                    className="nav-btn prev-btn"
                    onClick={() => goToStep(currentStep - 1)}
                    disabled={currentStep === 1}
                  >
                    <FaChevronLeft />
                    Previous
                  </button>

                  {!isStepCompleted(currentStep) && (
                    <button 
                      className="complete-btn"
                      onClick={completeStep}
                    >
                      <FaCheck />
                      Mark as Complete
                    </button>
                  )}

                  {currentStep < tutorial.steps.length ? (
                    <button 
                      className="nav-btn next-btn"
                      onClick={() => goToStep(currentStep + 1)}
                    >
                      Next
                      <FaChevronRight />
                    </button>
                  ) : (
                    <button 
                      className="finish-btn"
                      onClick={() => navigate('/tutorials')}
                    >
                      <FaTrophy />
                      Finish Tutorial
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TutorialView;