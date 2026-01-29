# Code Snippets Manager - User Guide

## Welcome to the Code Snippets Manager! 📝

This powerful tool helps you organize, search, and manage your code snippets across multiple programming languages.

## Getting Started

### Accessing the Snippets Manager
1. Click on "Snippets" in the navigation bar
2. Or navigate to `/snippets` in your browser

### First Time Setup
- No setup required!
- Snippets are automatically associated with your user account
- Your favorites are saved locally in your browser

## Creating Your First Snippet

### Step 1: Open the Creation Form
- Click the **"New Snippet"** button in the top-right corner
- A modal dialog will appear

### Step 2: Fill in the Details
1. **Title**: Give your snippet a descriptive name (max 120 characters)
   - You'll see a character counter as you type
   - Example: "React useState Hook Example"

2. **Language**: Select from 15+ programming languages
   - JavaScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, TypeScript, SQL, HTML, CSS, Bash, and more

3. **Code**: Paste or type your code
   - Uses monospace font for easy reading
   - Supports multi-line code
   - No character limit

### Step 3: Save Your Snippet
- Click **"Create Snippet"** to save
- Your snippet appears instantly in the list
- Modal closes automatically

## Managing Your Snippets

### Viewing Snippets
- All snippets display in a responsive grid
- Each card shows:
  - Snippet title
  - Programming language badge
  - Last updated date
  - Syntax-highlighted code preview
  - Action buttons

### Editing a Snippet
1. Click the **"Edit"** button on any snippet card
2. Modify the title, language, or code
3. Click **"Update Snippet"** to save changes
4. Or click **"Cancel"** to discard changes

### Deleting a Snippet
1. Click the **"Delete"** button on the snippet card
2. A confirmation dialog appears
3. Click **"Delete"** to confirm, or **"Cancel"** to keep it
4. ⚠️ Deletion is permanent and cannot be undone

### Copying Code
- Click the **"Copy"** button on any snippet
- Code is instantly copied to your clipboard
- A confirmation alert appears
- Paste anywhere using Ctrl+V (Windows) or Cmd+V (Mac)

## Search & Filter Features

### Searching Snippets
1. Type in the search bar at the top
2. Search works across:
   - Snippet titles
   - Code content
3. Results update in real-time as you type
4. Search is case-insensitive
5. Click the **X** icon to clear your search

### Filtering by Language
1. Click the language dropdown
2. Select a specific language
3. View only snippets in that language
4. Select **"All Languages"** to see everything

### Combined Search & Filter
- Use search and language filter together!
- Example: Search for "loop" and filter by "Python"
- Results show only Python snippets containing "loop"

## Favorites System ⭐

### Adding to Favorites
- Click the **star icon** in the top-right of any snippet card
- Icon turns gold when favorited
- Favorite snippets appear first in your list

### Removing from Favorites
- Click the gold star icon again
- Icon turns gray
- Snippet moves to regular list

### Why Use Favorites?
- Quick access to frequently used snippets
- Organize your most important code
- Favorites persist even after closing the browser

## Understanding the UI

### Snippet Card Components

#### Header Section
- **Title**: Your snippet name
- **Star Icon**: Click to favorite/unfavorite

#### Meta Information
- **Language Badge**: Shows programming language (purple gradient)
- **Date**: Last updated date in your local format

#### Code Preview
- Syntax-highlighted code display
- Line numbers included
- Scrollable if code is long
- Color scheme matches your theme (dark/light)

#### Action Buttons
- **Copy** (blue): Copy code to clipboard
- **Edit** (green): Open edit form
- **Delete** (red): Remove snippet (with confirmation)

### Theme Support
The Snippets Manager automatically adapts to your app theme:

#### Light Theme
- Clean white cards
- Blue/gray gradient background
- Dark text on light background
- Professional appearance

#### Dark Theme
- Dark cards with good contrast
- Dark blue/gray gradient background
- Light text on dark background
- Easy on the eyes

Switch themes using the moon/sun icon in the navigation bar!

## Special States

### Loading State
- Appears when fetching snippets
- Shows animated spinner
- Displays "Loading snippets..." message

### Empty State
When you have no snippets yet:
- Large code icon
- "No snippets found" message
- "Create your first snippet" prompt
- Quick "Create Snippet" button

### No Search Results
When search/filter returns nothing:
- Same empty state appears
- Adjust your search or filter to see results

## Tips & Tricks 💡

### Organization Best Practices
1. **Use Descriptive Titles**
   - ✅ "React Form Validation with Yup"
   - ❌ "code snippet 1"

2. **Choose Accurate Languages**
   - Helps with filtering later
   - Enables proper syntax highlighting

3. **Favorite Wisely**
   - Star your most-used snippets
   - Keep favorites list manageable (under 20)

4. **Regular Cleanup**
   - Delete outdated snippets
   - Update code as best practices evolve

### Productivity Shortcuts
- **Quick Copy**: One click to copy any snippet
- **Fast Search**: Start typing immediately in search bar
- **Language Jump**: Filter to find language-specific code quickly

### Code Preview Tips
- Preview shows first ~10 lines of code
- Hover to see scroll if code is longer
- Click Edit to view full code in textarea

## Keyboard Navigation

While keyboard shortcuts aren't yet implemented, you can use:
- **Tab**: Navigate between buttons and inputs
- **Enter**: Submit forms
- **Escape**: Close modals (planned for future update)

## Mobile Usage 📱

The Snippets Manager is fully responsive:

### Mobile Features
- Single column layout
- Touch-friendly buttons
- Optimized spacing
- Full-width forms
- Stacked action buttons

### Mobile Tips
- Tap and hold to select/copy code directly
- Use hamburger menu for navigation
- Zoom in on code preview if needed

## Common Scenarios

### Scenario 1: Saving Code from Tutorial
1. Copy code from tutorial
2. Click "New Snippet"
3. Paste code, add title
4. Select language
5. Save for future reference

### Scenario 2: Building a Personal Library
1. Create snippets for common patterns
2. Favorite your most-used ones
3. Use descriptive titles
4. Organize by language

### Scenario 3: Quick Reference
1. Search for snippet by name
2. Copy code instantly
3. Paste into your project
4. No need to remember syntax!

### Scenario 4: Sharing with Team
1. Copy snippet code
2. Share via chat/email
3. Team member creates their own snippet
4. (Future: Direct sharing feature planned)

## Troubleshooting

### Snippets Not Appearing
- Ensure you're logged in
- Check internet connection
- Refresh the page
- Check browser console for errors

### Copy Button Not Working
- Requires modern browser (Chrome, Firefox, Safari, Edge)
- HTTPS or localhost required
- Check browser clipboard permissions
- Try different browser if issues persist

### Favorites Not Saving
- Enable browser localStorage
- Check storage quota (unlikely to hit limit)
- Clear browser cache if problems persist
- Try incognito mode to test

### Theme Not Applying
- Check theme toggle in navbar
- Refresh page if theme stuck
- Clear browser cache
- Verify ThemeContext is working

### Modal Won't Close
- Click outside the modal
- Click the X button in top-right
- Click Cancel button
- Refresh page as last resort

## Supported Languages

The Snippets Manager supports syntax highlighting for:

1. **JavaScript** - The language of the web
2. **Python** - For data science and scripting
3. **Java** - Enterprise applications
4. **C++** - Systems programming
5. **C#** - .NET development
6. **PHP** - Server-side scripting
7. **Ruby** - Web apps and automation
8. **Go** - Cloud and backend services
9. **Rust** - Systems programming with safety
10. **TypeScript** - Typed JavaScript
11. **SQL** - Database queries
12. **HTML** - Web structure
13. **CSS** - Web styling
14. **Bash** - Shell scripting
15. **Other** - For any other language

Each language gets appropriate syntax highlighting in both light and dark themes!

## Future Features 🚀

Coming soon to the Snippets Manager:

### Planned Features
- 🏷️ **Tags System**: Categorize snippets with multiple tags
- 📤 **Export/Import**: Backup and restore your snippets
- 🔄 **Sync Across Devices**: Access snippets anywhere
- 📋 **Code Templates**: Pre-made snippet templates
- 🤝 **Sharing**: Share snippets with your team
- 📝 **Descriptions**: Add longer descriptions to snippets
- 🔍 **Advanced Search**: Search by tags, date, language
- 📊 **Usage Stats**: See your most-used snippets
- 🎨 **Folders**: Organize snippets in folders
- ⚡ **Keyboard Shortcuts**: Navigate faster

### Vote for Features
Have an idea? Let the development team know!

## Privacy & Security

### Your Data
- Snippets are stored in the database
- Associated with your user account
- Not shared with other users
- Favorites stored locally in your browser

### Best Practices
- Don't store API keys or passwords
- Don't include sensitive credentials
- Use environment variables for secrets
- Review code before saving

## Getting Help

### Need Assistance?
1. Check this user guide
2. Visit the FAQ page
3. Join our community Discord
4. Report issues on GitHub
5. Contact support team

### Report a Bug
1. Navigate to GitHub Issues
2. Click "New Issue"
3. Describe the problem
4. Include screenshots if helpful
5. Mention your browser/OS

## Conclusion

The Code Snippets Manager is your personal code library, always accessible and beautifully organized. Start building your collection today!

---

**Happy Coding! 🎉**

*Last Updated: January 2024*
*Version: 1.0.0*
