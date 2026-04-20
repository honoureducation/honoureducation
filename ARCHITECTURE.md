# 🏗️ ARCHITECTURE OVERVIEW

## System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  │ React App (port 3000)                                       │
│  │ ┌──────────────────────────────────────────┐                │
│  │ │ Pages/Components                         │                │
│  │ │ - AssessmentForm.js                      │                │
│  │ │ - AssessmentList.js                      │                │
│  │ │ - Navbar.js                              │                │
│  │ │                                          │                │
│  │ │ Services (API Layer)                     │                │
│  │ │ - api.js (Axios)                         │                │
│  │ └──────────────────────────────────────────┘                │
│  │            ↓                                                 │
└──────────────────────────────────────────────────────────────────┘
       HTTP/REST API (Fetch/Axios)
       ↓ POST /api/assessments
       ↓ GET /api/assessments
       ↓ DELETE /api/assessments/:id
       ↑
┌────────────┴──────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (port 5000)                     │
│                                                                   │
│  Routes (assessmentRoutes.js)                                    │
│  ├─ POST /api/assessments → createAssessment                    │
│  ├─ GET /api/assessments → getAllAssessments                    │
│  ├─ GET /api/assessments/:id → getAssessmentById                │
│  └─ DELETE /api/assessments/:id → deleteAssessment              │
│                                                                   │
│  Controllers (assessmentController.js)                           │
│  ├─ Request validation                                           │
│  ├─ Score calculation                                            │
│  ├─ Level assignment                                             │
│  └─ Response formatting                                          │
│                                                                   │
│  Models (Assessment.js - Mongoose)                               │
│  └─ MongoDB schema definition                                    │
│     ├─ studentName                                               │
│     ├─ class                                                      │
│     ├─ teacherName                                               │
│     ├─ answers[]                                                 │
│     ├─ totalScore                                                │
│     ├─ level                                                     │
│     └─ createdAt                                                 │
│                                                                   │
└───────────────────────┬────────────────────────────────────────────┘
                        │
                  MongoDB Driver
                        │
                        ↓
          ┌─────────────────────────┐
          │   MONGODB DATABASE      │
          └─────────────────────────┘
          └─ assessments collection
             ├─ Document 1
             ├─ Document 2
             └─ ...
```

---

## Data Flow

### Creating Assessment

1. **Frontend (AssessmentForm.js)**
   ```
   User fills form → Validates → Calculates score → Sends to API
   ```

2. **API Call (api.js)**
   ```
   axios.post('/api/assessments', assessmentData)
   ```

3. **Backend (Express)**
   ```
   Route → Controller → Validate → Calculate → Save → Return
   ```

4. **Database (MongoDB)**
   ```
   Insert document → Return with _id → Send to frontend
   ```

5. **Frontend (React)**
   ```
   Show success message → Clear form → Auto-hide message after 3s
   ```

### Fetching Assessments

1. **Frontend**
   ```
   useEffect → axios.get() → Set state
   ```

2. **Backend**
   ```
   Route → Controller → Query MongoDB → Return array
   ```

3. **Frontend Render**
   ```
   Map through array → Render table rows
   ```

---

## File Purpose Overview

### Frontend

```
frontend/
├── public/
│   └── index.html              # HTML container
│
├── src/
│   ├── components/
│   │   └── Navbar.js           # Navigation component
│   │       - Links to /form and /list
│   │       - Responsive design
│   │
│   ├── pages/
│   │   ├── AssessmentForm.js   # Form page component
│   │   │   - Student details inputs
│   │   │   - Question scoring
│   │   │   - Form validation
│   │   │   - Sum calculation
│   │   │   - API integration
│   │   │   - Success/error handling
│   │   │
│   │   └── AssessmentList.js   # List page component
│   │       - Fetch all assessments
│   │       - Display in table
│   │       - Delete functionality
│   │       - Empty state
│   │       - Loading/error states
│   │
│   ├── services/
│   │   └── api.js              # API communication layer
│   │       - createAssessment()
│   │       - getAllAssessments()
│   │       - getAssessmentById()
│   │       - deleteAssessment()
│   │       - Error handling
│   │
│   ├── App.js                  # Main app component
│   │   - Router setup
│   │   - Route definitions
│   │   - Navbar wrapper
│   │
│   ├── index.js                # React entry point
│   │   - Render App to DOM
│   │
│   └── index.css               # Global styles
│       - Tailwind imports
│       - Base resets
│
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS with Tailwind plugin
└── package.json                # Dependencies & scripts
```

### Backend

```
backend/
├── models/
│   └── Assessment.js           # Mongoose schema
│       - studentName (String)
│       - class (String)
│       - teacherName (String)
│       - answers (Array)
│       - totalScore (Number)
│       - level (String)
│       - createdAt (Date)
│
├── controllers/
│   └── assessmentController.js # Business logic
│       - createAssessment()    → POST validation + save
│       - getAllAssessments()   → GET all from DB
│       - getAssessmentById()   → GET single by ID
│       - deleteAssessment()    → DELETE by ID
│
├── routes/
│   └── assessmentRoutes.js     # Route definitions
│       - POST /api/assessments
│       - GET /api/assessments
│       - GET /api/assessments/:id
│       - DELETE /api/assessments/:id
│
├── server.js                   # Express initialization
│   - Create app
│   - Middleware setup (CORS, JSON)
│   - MongoDB connection
│   - Route registration
│   - Server listen
│
├── .env                        # Environment variables
│   - MONGODB_URI
│   - PORT
│
└── package.json                # Dependencies & scripts
```

---

## Component Hierarchy

```
App.js
├── Router
│   ├── Route: /form
│   │   └── Navbar
│   │       └── AssessmentForm
│   │           ├── Input (student details)
│   │           ├── RadioGroup (questions) ×10
│   │           ├── ScoreDisplay
│   │           └── SubmitButton
│   │
│   ├── Route: /list
│   │   └── Navbar
│   │       └── AssessmentList
│   │           ├── LoadingState
│   │           ├── EmptyState
│   │           ├── Table
│   │           │   ├── TableHeader
│   │           │   └── TableRow ×N
│   │           └── RefreshButton
│   │
│   └── Route: /
│       └── Redirect to /form
```

---

## Request/Response Flow

### POST /api/assessments

**Request:**
```
Frontend → axios.post('http://localhost:5000/api/assessments', {
  studentName: "John",
  class: "Year 7",
  teacherName: "Mrs Smith",
  answers: [
    { questionId: 1, score: 2 },
    { questionId: 2, score: 1 },
    ...
  ]
})
```

**Backend Processing:**
1. Receive request in route
2. Pass to controller.createAssessment()
3. Validate: check required fields
4. Calculate: Sum answers → totalScore
5. Assign: Calculate level from score
6. Create: new Assessment(data)
7. Save: assessment.save() to MongoDB
8. Respond: 201 status + assessment data

**Response:**
```json
{
  "message": "Assessment saved successfully",
  "assessment": {
    "_id": "507f...",
    "studentName": "John",
    "class": "Year 7",
    "teacherName": "Mrs Smith",
    "totalScore": 15,
    "level": "Advanced",
    "answers": [...],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Frontend Handling:**
- Catch response
- Show success message
- Clear form
- Auto-hide message after 3s

---

### GET /api/assessments

**Request:**
```
Frontend → axios.get('http://localhost:5000/api/assessments')
```

**Backend Processing:**
1. Receive request in route
2. Pass to controller.getAllAssessments()
3. Query: Assessment.find()
4. Sort: by createdAt descending
5. Return: array of documents

**Response:**
```json
[
  {
    "_id": "507f...",
    "studentName": "John",
    "class": "Year 7",
    "totalScore": 15,
    "level": "Advanced",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "_id": "608f...",
    "studentName": "Mary",
    ...
  }
]
```

**Frontend Handling:**
- Set state with array
- Map through and render table rows
- Add delete handlers to buttons

---

## Score Calculation Algorithm

```javascript
// Controller logic
const totalScore = answers.reduce((sum, answer) => {
  return sum + answer.score;  // Each answer: 0, 1, or 2
}, 0);

// Level assignment
const level = calculateLevel(totalScore);

function calculateLevel(score) {
  if (score >= 0 && score <= 5) return 'Beginner';
  if (score >= 6 && score <= 10) return 'Intermediate';
  return 'Advanced';
}

// Example:
// answers = [2, 1, 2, 0, 1, 2, 1, 0, 2, 1]
// sum = 2+1+2+0+1+2+1+0+2+1 = 12
// level = 12 >= 11 → 'Advanced'
```

---

## Error Handling

### Frontend Errors
```javascript
try {
  const response = await axios.post(url, data);
  // Handle success
} catch (error) {
  const errorMsg = error.response?.data?.error || error.message;
  setErrorMessage(errorMsg);
  // Show to user
}
```

### Backend Errors
```javascript
// Validation error (400)
if (!studentName) {
  return res.status(400).json({ error: 'Missing required fields' });
}

// Not found (404)
if (!assessment) {
  return res.status(404).json({ error: 'Assessment not found' });
}

// Server error (500)
catch (error) {
  res.status(500).json({ error: error.message });
}
```

---

## Database Schema Details

### Assessment Document

```javascript
{
  _id: ObjectId,              // MongoDB auto-generated ID
  studentName: String,        // "John Doe"
  class: String,              // "Year 7"
  teacherName: String,        // "Mrs. Smith"
  answers: [                  // Array of 10 answers
    {
      questionId: 1,          // Question number
      score: 2                // 0, 1, or 2
    },
    {
      questionId: 2,
      score: 1
    },
    // ... 8 more
  ],
  totalScore: 15,             // Sum of all scores (0-20)
  level: "Advanced",          // Based on totalScore
  createdAt: Date             // Timestamp (default: now)
}
```

### Indexes (Automatic)
- `_id` (unique)
- `createdAt` (for sorting)

---

## Performance Considerations

### Frontend
- ✅ Components only re-render when state changes
- ✅ Table uses index as key (ok for static list)
- ✅ Form fields are controlled components
- ✅ Axios handles request debouncing

### Backend
- ✅ Queries return only needed fields (could optimize further)
- ✅ Sorting on database side
- ✅ Proper error handling prevents crashes
- ✅ MongoDB indexing on frequently searched fields

### Database
- ✅ Single collection (simple structure)
- ✅ Documents are reasonably sized
- ✅ No complex joins needed

---

## Scaling Considerations

### Current Limitations
- Single MongoDB instance
- No authentication/authorization
- No pagination on list view
- All data returned to frontend

### Future Improvements
- Add pagination (20 per page)
- Add search/filter functionality
- Add user authentication
- Separate endpoints for student/teacher
- Add export to CSV/PDF
- Add charts/analytics
- Cache frequently accessed data
- Index by teacherName/studentName

---

## Environment Configuration

### Development
```env
MONGODB_URI=mongodb://localhost:27017/student-assessment
PORT=5000
NODE_ENV=development
```

### Production
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/student-assessment
PORT=5000
NODE_ENV=production
```

---

## Deployment Architecture

```
┌─────────────────────────────────────┐
│       Frontend (Vercel/Netlify)     │
│       - React static files           │
│       - CDN distribution             │
│       - Domain: example.com          │
└────────────┬────────────────────────┘
             │
             │ API calls to
             │
┌────────────▼────────────────────────┐
│       Backend (Heroku/Railway)      │
│       - Express server               │
│       - Node.js runtime              │
│       - Domain: api.example.com      │
└────────────┬────────────────────────┘
             │
             │ Database connection
             │
┌────────────▼────────────────────────┐
│    MongoDB Atlas (Cloud)            │
│    - Managed MongoDB                 │
│    - Backup & replication            │
│    - Connection string               │
└─────────────────────────────────────┘
```

---

## Testing Strategy (Optional)

### Frontend Testing (Jest + React Testing Library)
```javascript
// Test form submission
test('saves assessment on submit', async () => {
  render(<AssessmentForm />);
  // Fill form
  // Submit
  // Check API call with correct data
});
```

### Backend Testing (Jest + Supertest)
```javascript
// Test API endpoint
test('POST /api/assessments saves assessment', async () => {
  const response = await request(app)
    .post('/api/assessments')
    .send(testData)
    .expect(201);
  
  expect(response.body.assessment.totalScore).toBe(15);
});
```

---

## Summary

- **Simple**: Single collection, single model
- **Fast**: Direct API calls, no complex queries
- **Scalable**: Easy to add features
- **Maintainable**: Clear separation of concerns
- **Responsive**: Works on all devices
- **User-friendly**: Intuitive UI with clear feedback

---

**Architecture Complete! 🏗️**
