# Code Explainer - User Guide

## Getting Started with Code Explainer

The **Code Explainer** is an AI-powered tool that helps you understand any code snippet. Simply paste your code, and get instant, easy-to-understand explanations powered by advanced AI.

---

## How to Use

### Step 1: Access Code Explainer
1. Navigate to the **Code Explainer** page from the navbar
2. Or go directly to: `/code-explainer`

### Step 2: Paste Your Code
1. Click in the code input area
2. Paste any code snippet you want to understand
3. Maximum length: **2000 characters**

### Step 3: Get Explanation
1. Click the **"Explain Code"** button (with lightbulb icon)
2. Wait for the AI to process (usually 2-5 seconds)
3. View the explanation in the output section below

### Step 4: Copy or Download
- **Copy**: Click the "Copy" button to copy explanation to clipboard
- **Download**: Click the "Download" button to save as a .txt file

---

## Key Features

### 📝 Code Input
- Large text area for easy code pasting
- Real-time character counter
- Clear button to reset

### ⚡ Fast Processing
- Powered by Mistral 7B AI model
- Instant responses
- Markdown formatting for readability

### 📚 History Tracking
- Automatic storage of last 10 explanations
- Click history button to view (shows count badge)
- Quick access to previous queries
- Delete individual entries or clear all

### 💾 Offline Access
- All history saved in browser storage
- Works even if offline
- Persists across sessions

### 🎨 Theme Support
- Light and dark modes
- Auto-adapts to your theme preference
- Easy on the eyes in any lighting

---

## Example Use Cases

### 1. Learning New Syntax
```javascript
// Paste complex code
const users = data
  .filter(user => user.age > 18)
  .map(user => ({ ...user, verified: true }))
  .reduce((acc, user) => acc + user.score, 0);
```
✨ Get a breakdown of ES6 features and array methods

### 2. Understanding Algorithms
Paste any algorithm code and get step-by-step explanation of how it works.

### 3. Code Review Help
Get explanations of unfamiliar code during code reviews to speed up understanding.

### 4. Learning Programming
Understand code patterns and best practices across different languages.

---

## Tips & Tricks

### 💡 Tips for Best Results

1. **Be Specific**
   - Focus on code snippets (50-500 characters work best)
   - Use complete, runnable code for better explanations

2. **Supported Languages**
   - JavaScript/TypeScript
   - Python
   - Java
   - C++/C#
   - Go
   - Rust
   - PHP
   - And many more!

3. **Formatting Matters**
   - Use proper indentation
   - Include necessary imports
   - Keep code relevant and concise

4. **Use History**
   - Revisit previous explanations without re-explaining
   - Saves time and API usage

5. **Combine with Other Tools**
   - Use with Code Quality checker for comprehensive code review
   - Reference documentation alongside explanations

---

## Understanding Explanations

### Explanation Includes:
- ✅ What the code does (functionality)
- ✅ How it works (step-by-step breakdown)
- ✅ Key concepts involved (terminology)
- ✅ Best practices (if applicable)

### Format Features:
- 📌 **Bold text** for emphasis
- 📝 **Code blocks** for syntax examples
- 📋 **Lists** for organization
- 🔗 **Links** to resources (when available)

---

## History Management

### View History
1. Click the **history button** with count badge
2. Browse recent explanations
3. Click any entry to reload it

### Delete from History
- Click the **trash icon** on any history item
- Confirmation happens instantly

### Clear All History
1. Click history button to open sidebar
2. Click "Clear All" button
3. All entries will be deleted

### Why History is Useful
- No need to paste the same code twice
- Compare different code snippets
- Quick reference for learning
- Reduce API calls

---

## Troubleshooting

### "Code is too long"
- **Error**: You've exceeded 2000 characters
- **Solution**: Paste a smaller code snippet, or split into multiple queries

### "Please enter some code"
- **Error**: Input field is empty
- **Solution**: Make sure to paste code before clicking Explain

### "Failed to get explanation"
- **Error**: API connection issue
- **Solution**: 
  - Check your internet connection
  - Wait a moment and try again
  - If persists, report the issue

### Copy button not working
- **Error**: Browser permission issue
- **Solution**: 
  - Check if copy-to-clipboard is allowed
  - Try copying manually with Ctrl+C

### History not saving
- **Error**: Browser storage issue
- **Solution**:
  - Clear browser cache
  - Enable local storage in settings
  - Try a different browser

---

## Supported Code Languages

| Language | ✅ Supported |
|----------|-------------|
| JavaScript | ✅ |
| TypeScript | ✅ |
| Python | ✅ |
| Java | ✅ |
| C++ | ✅ |
| C# | ✅ |
| Go | ✅ |
| Rust | ✅ |
| PHP | ✅ |
| Ruby | ✅ |
| Kotlin | ✅ |
| Swift | ✅ |
| And more... | ✅ |

---

## Privacy & Data

### What We Store Locally
- Your code snippets (in browser only)
- Explanations (in browser only)
- Last 10 queries (in browser storage)

### What We DON'T Store
- ❌ No server-side code storage
- ❌ No personal information tracking
- ❌ No usage analytics

### Data Privacy
- All history stored locally on your device
- Clearing browser cache deletes all local history
- You have full control over your data

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move between fields |
| `Enter` (in textarea) | New line |
| `Ctrl+Enter` | Submit explanation request |
| `Esc` | Close history sidebar |

---

## Mobile Usage

### Mobile Optimization
- ✅ Full responsive design
- ✅ Touch-friendly buttons
- ✅ Optimized for portrait mode
- ✅ Works on all screen sizes

### Mobile Tips
- Use landscape mode for larger textarea
- History accessible on mobile
- Download works on mobile browsers
- Copy-to-clipboard works with system clipboard

---

## Comparison with Other Tools

| Feature | Code Explainer | Other Tools |
|---------|---|---|
| Free AI explanations | ✅ | ❌ |
| Local history | ✅ | ❌ |
| Download option | ✅ | ❌ |
| Multiple languages | ✅ | ✅ |
| Dark mode | ✅ | ✅ |
| No signup required | ✅ | ❌ |

---

## Advanced Usage

### Batch Processing
1. Save multiple code snippets
2. Use history to compare explanations
3. Build understanding progressively

### Learning Path
1. Start with simple code
2. Gradually increase complexity
3. Reference history for pattern recognition
4. Combine with challenges for practice

### Integration with Challenges
1. Solve a challenge
2. Use Code Explainer to understand similar patterns
3. Apply learning to next challenge

---

## Feedback & Suggestions

### Report Issues
- Use the GitHub issue tracker
- Include screenshot if possible
- Describe the exact problem
- Include code snippet if relevant

### Suggest Features
- ✨ Syntax highlighting
- ✨ Multiple language output
- ✨ Custom explanations depth
- ✨ Video tutorials integration

---

## FAQ

### Q: Is my code kept private?
**A:** Yes! Code never leaves your browser for history. API calls use your code but don't store it on servers.

### Q: Can I use for homework?
**A:** Yes, use it to understand concepts, but write your own code and solutions.

### Q: Does it support all programming languages?
**A:** Most popular languages are supported. Try pasting and see!

### Q: How long does explanation take?
**A:** Usually 2-5 seconds depending on server load.

### Q: Can I explain entire files?
**A:** Maximum 2000 characters. Break large files into logical functions.

### Q: Will my history disappear?
**A:** Only if you clear browser cache/storage. Otherwise it persists forever.

---

## Best Practices

### ✅ DO's
- ✅ Use clear, properly formatted code
- ✅ Include necessary context (imports, functions)
- ✅ Break complex code into smaller snippets
- ✅ Reference explanations while learning
- ✅ Use history to build knowledge progressively

### ❌ DON'Ts
- ❌ Paste malformed or incomplete code
- ❌ Expect perfect accuracy for all edge cases
- ❌ Rely solely on explanations without testing
- ❌ Paste sensitive credentials or keys
- ❌ Use for academic dishonesty

---

## Need Help?

- 📧 **Issues**: Report on GitHub (Issue #365)
- 📚 **Documentation**: See [CODE_EXPLAINER_IMPLEMENTATION.md](./CODE_EXPLAINER_IMPLEMENTATION.md)
- 💬 **Community**: Join discussions on GitHub
- 🚀 **Feedback**: Let us know your feature requests!

---

## Related Features

- 🐛 **Code Quality**: Check code quality alongside explanations
- 🎯 **Challenges**: Practice with guided challenges
- 📚 **Tutorials**: Learn from structured tutorials
- 🤝 **Collaborate**: Code with others in real-time

---

**Happy Learning! 🚀**

For more information, visit the [main documentation](./README.md)
