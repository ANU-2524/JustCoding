import axios from 'axios';
import Challenge from '../models/Challenge.js';
import Submission from '../models/Submission.js';

const languageMap = {
  javascript: { ext: 'js', version: '18.15.0' },
  python: { ext: 'py', version: '3.10.0' },
  java: { ext: 'java', version: '15.0.2' },
  cpp: { ext: 'cpp', version: '10.2.0' }
};

class ChallengeService {
  // Execute code against test cases
  static async runTestCases(code, language, testCases) {
    const results = [];
    const langInfo = languageMap[language];
    
    if (!langInfo) {
      throw new Error(`Unsupported language: ${language}`);
    }

    for (const testCase of testCases) {
      try {
        const startTime = Date.now();
        
        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
          language,
          version: langInfo.version,
          stdin: testCase.input,
          files: [{ name: `main.${langInfo.ext}`, content: code }],
        }, { timeout: testCase.timeLimit + 1000 });

        const executionTime = Date.now() - startTime;
        const output = (response.data.run.stdout || '').trim();
        const stderr = response.data.run.stderr || '';
        const expectedOutput = testCase.expectedOutput.trim();

        if (stderr && !output) {
          results.push({
            passed: false,
            input: testCase.isHidden ? '[Hidden]' : testCase.input,
            expectedOutput: testCase.isHidden ? '[Hidden]' : expectedOutput,
            actualOutput: stderr.substring(0, 500),
            executionTime,
            error: 'Runtime Error'
          });
        } else if (executionTime > testCase.timeLimit) {
          results.push({
            passed: false,
            input: testCase.isHidden ? '[Hidden]' : testCase.input,
            expectedOutput: testCase.isHidden ? '[Hidden]' : expectedOutput,
            actualOutput: 'Time Limit Exceeded',
            executionTime,
            error: 'TLE'
          });
        } else {
          const passed = output === expectedOutput;
          results.push({
            passed,
            input: testCase.isHidden ? '[Hidden]' : testCase.input,
            expectedOutput: testCase.isHidden ? '[Hidden]' : expectedOutput,
            actualOutput: testCase.isHidden && !passed ? '[Hidden]' : output,
            executionTime,
            error: null
          });
        }
      } catch (error) {
        results.push({
          passed: false,
          input: testCase.isHidden ? '[Hidden]' : testCase.input,
          expectedOutput: testCase.isHidden ? '[Hidden]' : testCase.expectedOutput,
          actualOutput: error.message,
          executionTime: 0,
          error: error.code === 'ECONNABORTED' ? 'Time Limit Exceeded' : 'Execution Error'
        });
      }
    }

    return results;
  }

  // Submit solution
  static async submitSolution(challengeId, odId, odName, code, language) {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Run test cases
    const testResults = await this.runTestCases(code, language, challenge.testCases);
    const passedTests = testResults.filter(r => r.passed).length;
    const totalTests = testResults.length;
    const allPassed = passedTests === totalTests;
    const totalTime = testResults.reduce((sum, r) => sum + r.executionTime, 0);

    // Determine status
    let status = 'wrong_answer';
    if (allPassed) {
      status = 'accepted';
    } else if (testResults.some(r => r.error === 'TLE')) {
      status = 'time_limit';
    } else if (testResults.some(r => r.error === 'Runtime Error')) {
      status = 'runtime_error';
    }

    // Calculate points (full points only for accepted)
    const points = allPassed ? challenge.points : 0;

    // Create submission
    const submission = new Submission({
      challengeId,
      odId,
      odName,
      code,
      language,
      status,
      testResults,
      passedTests,
      totalTests,
      executionTime: totalTime,
      points
    });

    await submission.save();

    // Update challenge stats
    challenge.attemptCount += 1;
    if (allPassed) {
      // Check if this user already solved it
      const previousSolve = await Submission.findOne({
        challengeId,
        odId,
        status: 'accepted',
        _id: { $ne: submission._id }
      });
      
      if (!previousSolve) {
        challenge.solvedCount += 1;
      }
    }
    await challenge.save();

    return submission;
  }

  // Get leaderboard for a challenge
  static async getChallengeLeaderboard(challengeId, limit = 50) {
    const submissions = await Submission.find({
      challengeId,
      status: 'accepted'
    })
    .sort({ executionTime: 1 })
    .limit(limit)
    .select('odId odName executionTime submittedAt');

    // Remove duplicates, keep fastest per user
    const seen = new Set();
    const leaderboard = [];
    
    for (const sub of submissions) {
      if (!seen.has(sub.odId)) {
        seen.add(sub.odId);
        leaderboard.push({
          rank: leaderboard.length + 1,
          odId: sub.odId,
          odName: sub.odName,
          executionTime: sub.executionTime,
          submittedAt: sub.submittedAt
        });
      }
    }

    return leaderboard;
  }

  // Get user's progress
  static async getUserProgress(odId) {
    const submissions = await Submission.find({ odId, status: 'accepted' })
      .populate('challengeId', 'difficulty points category');

    const stats = {
      totalSolved: 0,
      totalPoints: 0,
      byDifficulty: { easy: 0, medium: 0, hard: 0, expert: 0 },
      byCategory: {},
      recentSolves: []
    };

    const solvedChallenges = new Set();

    for (const sub of submissions) {
      if (sub.challengeId && !solvedChallenges.has(sub.challengeId._id.toString())) {
        solvedChallenges.add(sub.challengeId._id.toString());
        stats.totalSolved++;
        stats.totalPoints += sub.challengeId.points;
        stats.byDifficulty[sub.challengeId.difficulty]++;
        
        const cat = sub.challengeId.category;
        stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
      }
    }

    // Recent solves
    const recent = await Submission.find({ odId, status: 'accepted' })
      .sort({ submittedAt: -1 })
      .limit(10)
      .populate('challengeId', 'title slug difficulty');
    
    stats.recentSolves = recent.map(s => ({
      title: s.challengeId?.title,
      slug: s.challengeId?.slug,
      difficulty: s.challengeId?.difficulty,
      solvedAt: s.submittedAt
    }));

    return stats;
  }
}

export default ChallengeService;
