# Frontend Setup Guide

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start
```

The app will open at **http://localhost:3000**

## Project Structure

```
frontend/src/
├── components/
│   └── Navbar.js              # Navigation bar
├── pages/
│   ├── AssessmentForm.js      # Assessment form page
│   └── AssessmentList.js      # List of assessments
├── services/
│   └── api.js                 # API communication (Axios)
├── App.js                     # Main app with routing
├── index.js                   # React entry point
└── index.css                  # Global Tailwind styles
```

## Pages

### `/form` - Assessment Form Page

Features:
- Student details inputs (Name, Class, Teacher)
- 10 assessment questions with radio buttons
- Real-time score calculation
- Visual feedback (success/error messages)
- Clean centered layout
- Fully responsive design

**Form Layout:**
1. Header with instructions
2. Student Details Section
   - Student Name input
   - Class input
   - Teacher Name input
3. Assessment Questions Section
   - Question with 3 radio options (0/1/2)
   - Visual score guides
4. Score Summary Box
   - Shows current total score
   - Shows max possible score
5. Submit Button

### `/list` - Assessment List Page

Features:
- Table showing all assessments
- Sortable columns
- Color-coded level badges
- Delete functionality
- Refresh button
- Empty state messaging
- Responsive table

**Table Columns:**
- Student Name
- Class
- Teacher
- Score (e.g., "15/20")
- Level (Beginner/Intermediate/Advanced with color)
- Date & Time
- Delete button

## Components

### Navbar Component
- Navigation between pages
- Logo/branding
- Links to Form and List pages
- Sticky header

## Services

### api.js
Axios service for API communication:

```javascript
createAssessment(assessmentData)      // POST
getAllAssessments()                   // GET
getAssessmentById(id)                 // GET
deleteAssessment(id)                  // DELETE
```

All functions have error handling and return promises.

## Styling

Uses **Tailwind CSS** for styling:
- Responsive design (mobile, tablet, desktop)
- Utility-first CSS
- Custom colors: Indigo for primary, gradients for backgrounds
- Shadows, borders, rounded corners for depth

Global styles in `index.css`:
- Tailwind base, components, utilities
- Reset margin/padding
- Font family configuration

## Features

### Form Validation
- Checks all student details filled
- Checks all questions answered
- Shows error messages
- Prevents submission with missing data

### Score Calculation
- Real-time score update as answers selected
- Shows total vs. maximum possible score
- Auto-calculates in submission to backend

### Level Badge Styling
- Beginner: Red badge
- Intermediate: Yellow badge
- Advanced: Green badge

### Loading States
- Loading indicators on buttons
- Disabled state during submission
- Loading spinner on list page

### Error Handling
- Displays error messages to user
- Allows retry
- Clears errors when navigating

### Success Feedback
- Green success message after save
- Auto-clears after 3 seconds
- Form resets after successful submission

## Dependencies

- **react** - UI library
- **react-dom** - React DOM rendering
- **react-router-dom** - Client-side routing
- **axios** - HTTP client
- **tailwindcss** - Utility CSS framework
- **postcss** - CSS processor for Tailwind
- **autoprefixer** - Browser prefix support

## Configuration

### Proxy Configuration (package.json)
```json
"proxy": "http://localhost:5000"
```

This allows API calls to use `/api/assessments` instead of full URL.

### Tailwind Config (tailwind.config.js)
Configured to scan `src/**/*.{js,jsx,ts,tsx}` for class names.

### PostCSS Config (postcss.config.js)
Sets up Tailwind and Autoprefixer plugins.

## Available Scripts

```bash
# Start development server
npm start

# Build for production
npm build

# Run tests
npm test

# Eject (WARNING: one-way operation)
npm eject
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Tips for Development

1. **Hot Reload**: Changes auto-reload in browser
2. **Console Errors**: Check browser console for API errors
3. **React DevTools**: Install React DevTools extension
4. **Network Tab**: Use DevTools Network tab to debug API calls
5. **Mobile Testing**: Use browser DevTools responsive design mode

## API Integration

The frontend connects to backend at:
- Development: `http://localhost:5000`
- Production: Update API URL in `src/services/api.js`

## Customization

### Change Colors
Edit Tailwind classes in components:
```javascript
// From: bg-indigo-600
// To: bg-blue-600, bg-green-600, etc.
```

### Add Questions
Modify `QUESTIONS` array in `AssessmentForm.js`:
```javascript
const QUESTIONS = [
  'New question here?',
  // ... more questions
];
```

### Change Table Columns
Modify table headers/rows in `AssessmentList.js`

### Adjust Form Layout
Modify className values in component JSX

## Troubleshooting

### Port 3000 already in use
```bash
# Kill process
lsof -ti:3000 | xargs kill -9

# Or specify different port
PORT=3001 npm start
```

### Blank page
- Check browser console for errors
- Verify backend is running
- Clear cache and refresh

### Cannot connect to backend
- Verify backend runs on port 5000
- Check proxy setting in package.json
- Clear browser cache

### Styling not applied
- Rebuild Tailwind: `npm run build`
- Clear browser cache
- Check class names are correct

## Performance Tips

- Use React DevTools Profiler to identify slow renders
- Lazy load components if adding more pages
- Optimize re-renders with React.memo()
- Use useCallback for event handlers if needed

---

**Frontend ready! 🎨**
