# Code Quality Quick Reference

## Before You Commit

Run these commands to ensure code quality:

```bash
cd client
npm run lint:fix      # Fix linting issues
npm run format        # Format code
```

## Component Guidelines

### ✅ DO:
- Keep components under 200 lines
- Use lazy loading for route components
- Remove commented code before committing
- Use const/let instead of var
- Use === instead of ==
- Add braces to all if/else statements

### ❌ DON'T:
- Leave commented code in commits
- Mix import styles (use consistent lazy loading)
- Use console.log (use console.warn or console.error)
- Use debugger statements in production code
- Create components over 300 lines

## Component Structure Example

```jsx
// ✅ Good - Organized imports
import React from 'react';
import { useState } from 'react';
import ComponentA from './ComponentA';
import ComponentB from './ComponentB';
import './styles.css';

const MyComponent = () => {
  // Component logic
};

export default MyComponent;
```

## Lazy Loading Pattern

```jsx
// ✅ Good - Consistent lazy loading
import { lazy } from 'react';

const HomePage = lazy(() => import('./components/HomePage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
```

## Breaking Down Large Components

If a component exceeds 200 lines:

1. Identify logical sections (sidebar, header, content, etc.)
2. Extract into separate component files
3. Create a folder for related components
4. Keep the main component as a container

Example:
```
Dashboard/
├── index.jsx (main container)
├── Sidebar.jsx
├── Header.jsx
└── Content.jsx
```
