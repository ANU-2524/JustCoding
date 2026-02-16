import React from 'react';
import { FaUsers, FaClock, FaCode, FaCheck, FaTimes, FaCalendar } from 'react-icons/fa';
import '../../Style/UserDashboard.css';

const CollaborationTab = ({ sessions }) => {
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.startedAt) - new Date(a.startedAt)
  );

  // Calculate collaboration statistics
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter(s => s.endedAt).length;
  const activeSessions = sessions.filter(s => !s.endedAt).length;
  
  const totalTime = sessions.reduce((sum, session) => {
    if (session.endedAt) {
      const start = new Date(session.startedAt).getTime();
      const end = new Date(session.endedAt).getTime();
      return sum + (end - start);
    }
    return sum;
  }, 0);
  
  const avgSessionTime = completedSessions > 0 ? totalTime / completedSessions / 1000 / 60 : 0;

  return (
    <div className="dashboard-section">
      <div className="section-header">
        <h2>Collaboration History</h2>
        <p>Track your collaborative coding sessions and teamwork</p>
      </div>

      {/* Collaboration Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3><FaUsers /> Total Sessions</h3>
          <div className="stat-number">{totalSessions}</div>
          <div className="stat-description">Collaboration sessions joined</div>
        </div>
        
        <div className="stat-card">
          <h3><FaCheck /> Completed</h3>
          <div className="stat-number">{completedSessions}</div>
          <div className="stat-description">Successfully finished sessions</div>
        </div>
        
        <div className="stat-card">
          <h3><FaClock /> Active Now</h3>
          <div className="stat-number">{activeSessions}</div>
          <div className="stat-description">Currently in progress</div>
        </div>
        
        <div className="stat-card">
          <h3><FaClock /> Avg Duration</h3>
          <div className="stat-number">{avgSessionTime.toFixed(1)}m</div>
          <div className="stat-description">Average session length</div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="collaboration-history">
        <h3><FaCalendar /> Recent Sessions</h3>
        
        {sortedSessions.length === 0 ? (
          <div className="empty-state">
            <FaUsers className="empty-icon" />
            <h3>No Collaboration Sessions Yet</h3>
            <p>Join a coding room to start collaborating with others!</p>
          </div>
        ) : (
          <div className="sessions-list">
            {sortedSessions.map((session) => {
              const startDate = new Date(session.startedAt);
              const endDate = session.endedAt ? new Date(session.endedAt) : null;
              const duration = endDate ? ((endDate - startDate) / 1000 / 60).toFixed(1) : 'In Progress';
              const isActive = !session.endedAt;
              
              return (
                <div key={session.id} className={`session-card ${isActive ? 'active' : ''}`}>
                  <div className="session-header">
                    <div>
                      <h4>{session.roomId || 'Unnamed Session'}</h4>
                      <div className="session-meta">
                        <span className="session-date">
                          <FaCalendar /> {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className={`session-status ${isActive ? 'active' : 'completed'}`}>
                          {isActive ? <><FaUsers /> Active</> : <><FaCheck /> Completed</>}
                        </span>
                      </div>
                    </div>
                    <div className="session-duration">
                      <FaClock /> {duration}{!isActive ? 'm' : ''}
                    </div>
                  </div>
                  
                  <div className="session-details">
                    <p><strong>Participants:</strong> {session.participants?.length || 1} coder(s)</p>
                    {session.language && <p><strong>Language:</strong> {session.language}</p>}
                    {session.problemTitle && <p><strong>Problem:</strong> {session.problemTitle}</p>}
                    {isActive && (
                      <div className="session-actions">
                        <button className="btn-small primary">
                          <FaUsers /> Join Session
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Collaboration Insights */}
      <div className="collaboration-insights">
        <h3>Collaboration Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Team Player</h4>
            <p>You've participated in {totalSessions} collaborative sessions</p>
          </div>
          <div className="insight-card">
            <h4>Consistency</h4>
            <p>Your average session duration is {avgSessionTime.toFixed(1)} minutes</p>
          </div>
          <div className="insight-card">
            <h4>Completion Rate</h4>
            <p>You've completed {completedSessions}/{totalSessions} sessions ({totalSessions > 0 ? Math.round((completedSessions/totalSessions)*100) : 0}%)</p>
          </div>
          <div className="insight-card">
            <h4>Active Participation</h4>
            <p>You currently have {activeSessions} session(s) in progress</p>
          </div>
        </div>
      </div>

      {/* Collaboration Tips */}
      <div className="collaboration-tips">
        <h3>Tips for Better Collaboration</h3>
        <ul>
          <li>Communicate clearly with your teammates</li>
          <li>Share your screen regularly to stay synchronized</li>
          <li>Take breaks during long sessions</li>
          <li>Review code together before submitting</li>
          <li>Be patient and supportive of others</li>
        </ul>
      </div>
    </div>
  );
};

export default CollaborationTab;