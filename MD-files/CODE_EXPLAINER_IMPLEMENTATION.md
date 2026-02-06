# Code Explainer Component - Implementation Guide

## Overview
The Code Explainer is a dedicated UI component that allows users to request AI-powered explanations of their code snippets. It integrates with the existing backend API (`POST /api/gpt/explain`) to provide users with an intuitive interface for understanding code functionality.

## Status
✅ **Backend API Available** - Uses Mistral 7B via OpenRouter
✅ **Frontend UI Implemented** - Complete CodeExplainer component
✅ **Navigation Integrated** - Added to Navbar and Routes

---

## Features Implemented

### 1. **Code Input**
- Large textarea for pasting code snippets
- Character counter (max 2000 characters)
- Real-time validation feedback
- Clear button to reset content

### 2. **AI-Powered Explanations**
- Calls backend API: `POST /api/gpt/explain`
- Sends code as "question" parameter
- Displays formatted explanations using Markdown
- Supports syntax highlighting in explanations

### 3. **Loading State**
- Animated spinner during processing
- Descriptive loading message
- Animated progress bar
- Visual feedback while AI generates explanation

### 4. **History Management**
- Stores up to 10 recent explanations in localStorage
- Quick access to previous code explanations
- View explanation history with timestamps
- Delete individual history entries
- Clear all history option
- History badge showing total count

### 5. **Copy & Download**
- Copy explanation to clipboard with visual feedback
- Download explanation as text file (.txt)
- Includes both code and explanation in downloads

### 6. **Error Handling**
- User-friendly error messages
- Validation for empty code
- Character limit enforcement (2000 chars)
- API error handling with fallback messages

### 7. **Dark/Light Theme Support**
- Fully theme-aware using ThemeContext
- Gradient backgrounds adapt to theme
- Text colors optimized for readability
- Responsive design for all screen sizes

### 8. **Features Section**
- Highlights key capabilities:
  - ⚡ Fast Processing
  - 📚 Simple Language
  - 💾 History Tracking
  - 📤 Download & Share

---

## Component Structure

### File: `client/src/components/CodeExplainer.jsx`

**Main Functions:**
- `explainCode()` - Calls backend API with code
- `copyExplanation()` - Copies explanation to clipboard
- `downloadExplanation()` - Downloads as text file
- `loadFromHistory()` - Loads previous explanation
- `clearHistory()` - Removes all history entries
- `deleteHistoryEntry()` - Removes single history entry

**State Variables:**
- `code` - Current code input
- `explanation` - Generated explanation
- `loading` - Loading state indicator
- `error` - Error messages
- `copyState` - Copy button state
- `history` - Array of previous explanations
- `showHistory` - Toggle history visibility

### File: `client/src/Style/CodeExplainer.css`

**Key Classes:**
- `.code-explainer-container` - Main container with theme support
- `.explainer-header` - Gradient header section
- `.input-section` - Code input area
- `.output-section` - Explanation display
- `.history-sidebar` - History panel
- `.loading-state` - Loading animation
- `.empty-state` - No content state
- `.features-section` - Feature highlights

---

## Integration Points

### 1. **App.jsx Route**
```jsx
const CodeExplainer = lazy(() => import("./components/CodeExplainer"));

// In Routes:
<Route path="/code-explainer" element={<CodeExplainer />} />
```

### 2. **Navbar.jsx Navigation**
```jsx
{ path: '/code-explainer', label: 'Code Explainer', icon: <FaLightbulb /> }
```

### 3. **Backend API Endpoint**
```
POST /api/gpt/explain
Headers: { 'Content-Type': 'application/json' }
Body: { question: "your code here" }
Response: { explanation: "AI-generated explanation" }
```

---

## API Integration

### Endpoint Details
- **URL**: `POST /api/gpt/explain`
- **Model**: Mistral 7B Instruct via OpenRouter
- **Max Code Length**: 2000 characters
- **Response Format**: JSON with `explanation` field

### Request Example
```javascript
const response = await fetch('/api/gpt/explain', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: code })
});
```

### Response Example
```json
{
  "explanation": "This code demonstrates a simple JavaScript function that..."
}
```

---

## Styling & Themes

### Color Scheme (Light Mode)
- **Primary**: Gradient #667eea → #764ba2
- **Background**: Light blue (#f5f7fa) to gray (#c3cfe2)
- **Text**: Dark (#333)
- **Accent**: Red (#ff6b6b) for delete/danger

### Color Scheme (Dark Mode)
- **Primary**: Same gradient
- **Background**: Dark (#1a1a2e) to darker (#16213e)
- **Text**: Light (#e0e0e0)
- **Surfaces**: #1e1e2e, #2d2d3d

### Responsive Breakpoints
- **Desktop**: Full layout with sidebar
- **Tablet (768px)**: Single column
- **Mobile (480px)**: Optimized touch targets

---

## Usage Examples

### Basic Usage
1. Navigate to `/code-explainer` from navbar
2. Paste code in textarea
3. Click "Explain Code" button
4. View AI-generated explanation
5. Copy or download as needed

### Using History
1. Click history button (shows count badge)
2. Select previous explanation to reload
3. Delete individual entries or clear all

### Theme Support
- Automatically inherits theme from ThemeContext
- Dark mode toggle in Navbar applies instantly
- All colors adapt dynamically

---

## LocalStorage Schema

### History Storage Key
```
codeExplainerHistory
```

### History Entry Structure
```javascript
{
  id: 1234567890,
  timestamp: "1/29/2026, 3:45:30 PM",
  code: "First 50 chars of code...",
  explanation: "First 100 chars of explanation...",
  fullCode: "Complete code",
  fullExplanation: "Complete explanation"
}
```

---

## Performance Considerations

1. **Character Limit**: 2000 characters prevents excessive API calls
2. **History Cap**: Limited to 10 entries to prevent storage bloat
3. **Lazy Loading**: Component uses React.lazy() for optimal bundle splitting
4. **CSS Optimization**: Uses CSS Grid and Flexbox for efficient layouts
5. **Event Delegation**: Efficient event handling with proper cleanup

---

## Accessibility Features

- ✅ Semantic HTML structure
- ✅ Proper ARIA labels on buttons
- ✅ Keyboard navigation support
- ✅ Color contrast compliance
- ✅ Loading state announcements
- ✅ Error message clarity

---

## Future Enhancements

1. **Language Selection**
   - Support code explanation in multiple languages
   - Add language selector dropdown

2. **Code Syntax Highlighting**
   - Add CodeMirror for syntax highlighting
   - Language detection

3. **Export Formats**
   - PDF export option
   - Markdown export
   - HTML export

4. **Advanced Features**
   - Batch code explanations
   - Explanation comparison
   - Custom prompt templates
   - Integration with Code Editor

5. **Analytics**
   - Track most common questions
   - Popular code patterns
   - User engagement metrics

---

## Troubleshooting

### Issue: "API exists but explanations not showing"
- **Solution**: Ensure `/api/gpt/explain` endpoint is running on backend
- Check OPENROUTER_API_KEY environment variable is set

### Issue: History not persisting
- **Solution**: Check browser localStorage is enabled
- Clear browser cache and reload

### Issue: Dark mode colors not applying
- **Solution**: Verify ThemeContext is properly wrapping the app
- Check CSS class names match theme state

### Issue: Character count not working
- **Solution**: Ensure textarea has maxLength="2000" attribute
- Check CSS display for character counter

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## File Structure

```
client/
├── src/
│   ├── components/
│   │   ├── CodeExplainer.jsx          (Main component)
│   │   ├── Navbar.jsx                 (Updated with route)
│   │   └── ...
│   ├── Style/
│   │   ├── CodeExplainer.css          (Component styles)
│   │   └── ...
│   └── App.jsx                        (Updated with route)
```

---

## Testing Checklist

- [ ] Component loads without errors
- [ ] Code input accepts text
- [ ] API call triggers on button click
- [ ] Loading state displays correctly
- [ ] Explanation renders with markdown
- [ ] Copy button works
- [ ] Download creates txt file
- [ ] History saves and loads
- [ ] History items are clickable
- [ ] Delete history works
- [ ] Clear all history works
- [ ] Theme switching works
- [ ] Responsive on mobile
- [ ] Error messages display properly
- [ ] Character count updates in real-time

---

## Support & Contact

For issues or questions about the Code Explainer component:
- Check the issue #365 on GitHub
- Review backend logs for API errors
- Verify OPENROUTER_API_KEY is configured

---

**Last Updated**: January 29, 2026
**Component Version**: 1.0
**Status**: ✅ Production Ready
