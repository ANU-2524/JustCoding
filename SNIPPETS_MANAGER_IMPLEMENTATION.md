# Issue #367 - Code Snippets Manager Implementation

## Overview
This document provides a comprehensive guide for the Code Snippets Manager feature implementation, which allows users to create, organize, search, and manage their code snippets efficiently.

## Feature Summary
The Snippets Manager provides a complete CRUD interface for managing code snippets with advanced features:
- ✅ Create, read, update, and delete snippets
- ✅ Search and filter by language
- ✅ Syntax highlighting for 15+ languages
- ✅ Favorite/star functionality
- ✅ Copy to clipboard
- ✅ Responsive design for all screen sizes
- ✅ Dark/light theme support
- ✅ Real-time updates
- ✅ Character count for titles (120 max)
- ✅ Delete confirmation dialog

## Technical Architecture

### Frontend Component
**File**: `client/src/components/SnippetsManager.jsx`
- **Lines**: 430+
- **Dependencies**:
  - `react` - Core hooks (useState, useEffect, useContext)
  - `react-icons/fa` - UI icons
  - `react-syntax-highlighter` - Code syntax highlighting
  - `ThemeContext` - Dark/light theme support

### Styling
**File**: `client/src/Style/SnippetsManager.css`
- **Lines**: 800+
- **Features**:
  - Responsive grid layout
  - Theme-aware color schemes
  - Modal animations
  - Custom scrollbar styling
  - Mobile-first design

### Backend API Integration
**Routes**: `/api/user/snippets/*`
- `GET /api/user/snippets/:userId` - Fetch all user snippets
- `POST /api/user/snippets` - Create new snippet
- `PUT /api/user/snippets/:snippetId` - Update snippet
- `DELETE /api/user/snippets/:snippetId` - Delete snippet
- `POST /api/user/snippets/sync` - Bulk sync snippets

### Database Schema
**Model**: `server/models/Snippet.js`
```javascript
{
  userId: String (required, indexed),
  title: String (max 120 chars),
  language: String (default: 'javascript'),
  code: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Component Structure

### State Management
```javascript
const [snippets, setSnippets] = useState([]);
const [loading, setLoading] = useState(true);
const [searchQuery, setSearchQuery] = useState('');
const [selectedLanguage, setSelectedLanguage] = useState('all');
const [showModal, setShowModal] = useState(false);
const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
const [editingSnippet, setEditingSnippet] = useState(null);
const [favorites, setFavorites] = useState([]);
const [formData, setFormData] = useState({
  title: '',
  language: 'javascript',
  code: '',
  tags: ''
});
```

### Core Functions

#### 1. Fetch Snippets
```javascript
const fetchSnippets = async () => {
  const response = await fetch(`http://localhost:3001/api/user/snippets/${userId}`);
  const data = await response.json();
  setSnippets(data);
};
```

#### 2. Create Snippet
```javascript
const createSnippet = async () => {
  const response = await fetch('http://localhost:3001/api/user/snippets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      title: formData.title || 'Untitled',
      language: formData.language,
      code: formData.code
    })
  });
};
```

#### 3. Update Snippet
```javascript
const updateSnippet = async () => {
  const response = await fetch(`http://localhost:3001/api/user/snippets/${editingSnippet._id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, title, language, code })
  });
};
```

#### 4. Delete Snippet
```javascript
const deleteSnippet = async (snippetId) => {
  const response = await fetch(`http://localhost:3001/api/user/snippets/${snippetId}?userId=${userId}`, {
    method: 'DELETE'
  });
  setSnippets(snippets.filter(s => s._id !== snippetId));
};
```

## UI Components

### 1. Header Section
- Title with icon
- "New Snippet" button
- Responsive layout

### 2. Controls Section
- **Search Bar**: Real-time search across title and code
- **Language Filter**: Dropdown with 15+ languages
- **Clear Button**: Reset search query

### 3. Snippets Grid
- Auto-responsive grid layout
- Snippet cards with:
  - Title and favorite button
  - Language badge
  - Last updated date
  - Syntax-highlighted code preview
  - Action buttons (Copy, Edit, Delete)

### 4. Modal Dialog (Create/Edit)
- Form fields:
  - Title input (120 char limit with counter)
  - Language dropdown
  - Code textarea (monospace font)
- Submit and cancel buttons
- Click-outside to close

### 5. Delete Confirmation
- Warning icon
- Confirmation message
- Cancel and delete buttons

### 6. Empty State
- Displayed when no snippets found
- Icon and helpful message
- "Create Snippet" call-to-action

### 7. Loading State
- Animated spinner
- Loading message

## Supported Languages
1. JavaScript
2. Python
3. Java
4. C++
5. C#
6. PHP
7. Ruby
8. Go
9. Rust
10. TypeScript
11. SQL
12. HTML
13. CSS
14. Bash
15. Other

## Features in Detail

### Search & Filter
- **Search**: Matches against snippet title and code content
- **Language Filter**: Filter by programming language
- **Combined Filtering**: Search and language filter work together
- **Case Insensitive**: Search is not case-sensitive

### Favorites System
- Click star icon to favorite/unfavorite
- Favorited snippets appear first in the list
- Favorites persist in localStorage
- Gold star icon for favorited snippets
- Gray star icon for regular snippets

### Syntax Highlighting
- Uses `react-syntax-highlighter` with Prism
- Dark theme: `vscDarkPlus`
- Light theme: `vs`
- Line numbers enabled
- Max height: 200px with scroll
- Font size: 13px

### Copy to Clipboard
- One-click copy functionality
- Alert confirmation
- Uses native `navigator.clipboard.writeText()`

### Theme Support
- Automatically adapts to app theme
- Light theme: Blue/gray gradient background
- Dark theme: Dark blue/gray gradient
- All UI elements theme-aware

## Responsive Design

### Desktop (>768px)
- Multi-column grid layout
- Full navigation visible
- Side-by-side form actions

### Mobile (<768px)
- Single column layout
- Stacked form actions
- Full-width buttons
- Hamburger menu
- Optimized touch targets

## Installation & Setup

### 1. Dependencies
All required dependencies are already installed:
```json
{
  "react": "^19.1.0",
  "react-icons": "^5.5.0",
  "react-syntax-highlighter": "^16.1.0"
}
```

### 2. Route Configuration
Added to `client/src/App.jsx`:
```javascript
const SnippetsManager = lazy(() => import("./components/SnippetsManager"));
// ...
<Route path="/snippets" element={<SnippetsManager />} />
```

### 3. Navigation Integration
Added to `client/src/components/Navbar.jsx`:
```javascript
import { FaSave } from 'react-icons/fa';
// ...
{ path: '/snippets', label: 'Snippets', icon: <FaSave /> }
```

### 4. Backend Setup
Backend routes already exist in `server/routes/user.js`:
- No additional backend changes required
- MongoDB Snippet model already configured
- All CRUD endpoints functional

## Usage Guide

### Creating a Snippet
1. Click "New Snippet" button
2. Enter title (max 120 characters)
3. Select programming language
4. Paste or type code
5. Click "Create Snippet"

### Editing a Snippet
1. Click "Edit" button on snippet card
2. Modify title, language, or code
3. Click "Update Snippet"

### Deleting a Snippet
1. Click "Delete" button on snippet card
2. Confirm deletion in popup dialog
3. Snippet permanently removed

### Searching Snippets
1. Type in search bar
2. Results filter in real-time
3. Click X icon to clear search

### Filtering by Language
1. Select language from dropdown
2. View snippets in that language only
3. Select "All Languages" to reset

### Favoriting Snippets
1. Click star icon on snippet card
2. Favorited snippets appear first
3. Click again to unfavorite

### Copying Code
1. Click "Copy" button
2. Code copied to clipboard
3. Alert confirms successful copy

## Error Handling

### Network Errors
- Try-catch blocks around all API calls
- Error messages logged to console
- User alerts for failed operations

### Validation
- Title required for creation
- Code required for creation
- 120 character limit on titles
- userId validation on backend

### Empty States
- No snippets: Helpful empty state with CTA
- No search results: Clear message
- Loading state: Animated spinner

## Performance Optimizations

### Efficient Rendering
- Conditional rendering for modals
- Filtered arrays computed only when needed
- LocalStorage for favorites persistence

### API Efficiency
- Single fetch on component mount
- Optimistic UI updates
- Minimal re-renders

### Code Splitting
- Lazy loading via React.lazy()
- Suspense boundary in App.jsx
- Reduced initial bundle size

## Testing Checklist

### Functionality
- ✅ Create snippet
- ✅ Edit snippet
- ✅ Delete snippet
- ✅ Search snippets
- ✅ Filter by language
- ✅ Toggle favorites
- ✅ Copy to clipboard
- ✅ Theme switching

### UI/UX
- ✅ Responsive layout
- ✅ Modal animations
- ✅ Loading states
- ✅ Empty states
- ✅ Error handling
- ✅ Accessibility

### Browser Compatibility
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## Known Limitations

1. **Tags System**: Planned for future update (currently in formData but not implemented)
2. **Export/Import**: Not yet implemented
3. **Code Templates**: Could be added in future
4. **Sharing**: No sharing functionality yet
5. **Version History**: Not tracked
6. **Bulk Operations**: No multi-select/bulk actions

## Future Enhancements

### Short Term
- [ ] Implement tagging system
- [ ] Add search by tags
- [ ] Export snippets to JSON/ZIP
- [ ] Import snippets from file

### Medium Term
- [ ] Code templates library
- [ ] Snippet sharing with public/private toggle
- [ ] Duplicate snippet functionality
- [ ] Sort options (date, title, language)

### Long Term
- [ ] Version history for snippets
- [ ] Collaborative snippet editing
- [ ] AI-powered code suggestions
- [ ] Integration with GitHub Gists

## Troubleshooting

### Snippets Not Loading
1. Check backend server is running on port 3001
2. Verify MongoDB connection
3. Check browser console for errors
4. Ensure userId exists in localStorage

### Copy Not Working
1. Requires HTTPS or localhost
2. Check clipboard permissions
3. Try different browser

### Theme Not Switching
1. Verify ThemeContext import
2. Check theme prop in CSS
3. Ensure theme provider wraps app

### Favorites Not Persisting
1. Check localStorage is enabled
2. Verify browser storage limits
3. Clear cache and retry

## API Reference

### GET /api/user/snippets/:userId
**Description**: Fetch all snippets for a user
**Response**:
```json
[
  {
    "_id": "123",
    "userId": "user123",
    "title": "Hello World",
    "language": "javascript",
    "code": "console.log('Hello');",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/user/snippets
**Description**: Create new snippet
**Request Body**:
```json
{
  "userId": "user123",
  "title": "My Snippet",
  "language": "python",
  "code": "print('Hello')"
}
```

### PUT /api/user/snippets/:snippetId
**Description**: Update existing snippet
**Request Body**:
```json
{
  "userId": "user123",
  "title": "Updated Title",
  "language": "javascript",
  "code": "console.log('Updated');"
}
```

### DELETE /api/user/snippets/:snippetId
**Description**: Delete snippet
**Query Parameters**: `userId`
**Response**:
```json
{
  "deleted": true,
  "snippetId": "123"
}
```

## Conclusion
The Code Snippets Manager is a fully functional feature that provides users with a powerful tool to organize and manage their code snippets. With syntax highlighting, search/filter capabilities, favorites system, and responsive design, it offers a professional-grade snippet management experience.

## Issue Resolution
✅ **Issue #367 RESOLVED**
- All requirements implemented
- Component fully functional
- Documentation complete
- Integration successful
- Ready for production use
