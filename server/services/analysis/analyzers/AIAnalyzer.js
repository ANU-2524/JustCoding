import axios from 'axios';
import AnalyzerPlugin from '../AnalyzerPlugin.js';
import AnalysisResult from '../AnalysisResult.js';

class AIAnalyzer extends AnalyzerPlugin {
  constructor() {
    super('AI-Powered', '1.0.0', ['javascript', 'python', 'java', 'cpp', 'go', 'c', 'ruby', 'php', 'rust', 'swift']);
    this.timeout = 15000; // 15 seconds for AI calls
  }

  async analyze(code, language, options = {}) {
    const result = new AnalysisResult(this.name, this.version);
    const startTime = Date.now();

    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        result.addSuggestion('AI analysis unavailable (API key not configured)');
        result.executionTime = Date.now() - startTime;
        return result;
      }

      const prompt = this.buildPrompt(code, language);
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a code quality expert. Analyze code and provide concise improvements.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      const analysis = response.data.choices[0]?.message?.content || '';
      
      // Parse AI response
      this.parseAISuggestions(analysis, result);

    } catch (error) {
      if (error.code !== 'ECONNABORTED') {
        result.addSuggestion('AI analysis temporarily unavailable');
      }
    }

    result.executionTime = Date.now() - startTime;
    return result;
  }

  buildPrompt(code, language) {
    return `Analyze this ${language} code for:
1. Best practices violations
2. Performance improvements
3. Code smells
4. Refactoring suggestions

Provide 3-5 specific, actionable improvements.

Code:
\`\`\`${language}
${code.substring(0, 2000)}
\`\`\``;
  }

  parseAISuggestions(text, result) {
    const lines = text.split('\n').filter(l => l.trim());
    
    lines.forEach((line, idx) => {
      if (line.match(/^\d+\.|^-|^•/)) {
        result.addSuggestion(line.replace(/^\d+\.|^-|^•/, '').trim());
      }
    });

    if (result.suggestions.length === 0) {
      result.addSuggestion(text.substring(0, 200));
    }
  }
}

export default AIAnalyzer;
