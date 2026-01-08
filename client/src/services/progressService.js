const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://just-coding-theta.vercel.app/api' 
  : 'http://localhost:4334/api';

class ProgressService {
  static generateUserId() {
    let userId = localStorage.getItem('justcoding:userId');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('justcoding:userId', userId);
    }
    return userId;
  }

  static async getDashboard() {
    try {
      const userId = this.generateUserId();
      const response = await fetch(`${API_BASE}/progress/dashboard/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      return null;
    }
  }

  static async recordEvent(eventType, metadata = {}) {
    try {
      const userId = this.generateUserId();
      const response = await fetch(`${API_BASE}/progress/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          eventType,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record event');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Event recording error:', error);
      return null;
    }
  }

  static async getLeaderboard(timeframe = 'all-time', limit = 10) {
    try {
      const response = await fetch(`${API_BASE}/progress/leaderboard?timeframe=${timeframe}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      return [];
    }
  }

  static async exportProgress() {
    try {
      const userId = this.generateUserId();
      const response = await fetch(`${API_BASE}/progress/export/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to export progress');
      }
      
      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Export error:', error);
      return null;
    }
  }

  // Fallback to localStorage when API is unavailable
  static getFallbackData() {
    const stats = JSON.parse(localStorage.getItem('justcoding:v1') || '{}').stats || {};
    return {
      user: {
        userId: this.generateUserId(),
        displayName: 'Guest',
        totalPoints: stats.runs * 5 + stats.aiExplains * 3 + stats.aiDebugs * 4 + stats.snippetsCreated * 8,
        level: Math.floor((stats.runs * 5 + stats.aiExplains * 3) / 100) + 1,
        badges: []
      },
      totalEvents: (stats.runs || 0) + (stats.aiExplains || 0) + (stats.aiDebugs || 0),
      eventStats: {
        code_run: { count: stats.runs || 0, points: (stats.runs || 0) * 5 },
        ai_explain: { count: stats.aiExplains || 0, points: (stats.aiExplains || 0) * 3 },
        ai_debug: { count: stats.aiDebugs || 0, points: (stats.aiDebugs || 0) * 4 },
        snippet_create: { count: stats.snippetsCreated || 0, points: (stats.snippetsCreated || 0) * 8 }
      },
      topLanguages: [{ _id: 'javascript', count: stats.runs || 0 }],
      badges: [],
      dailyStreak: 0
    };
  }
}

export default ProgressService;