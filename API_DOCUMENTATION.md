# 📡 API DOCUMENTATION

## Base URL
```
http://localhost:5000/api
```

## Overview

Simple RESTful API for managing student assessments. All responses are in JSON format.

---

## Authentication

❌ **No authentication required** - this is a development app

---

## Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "assessment": { ... }
}
```

### Error Response
```json
{
  "error": "Error description here"
}
```

---

## Endpoints

### 1. Create Assessment

**Endpoint:** `POST /api/assessments`

**Description:** Create and save a new assessment

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "studentName": "John Doe",
  "class": "Year 7",
  "teacherName": "Mrs. Smith",
  "answers": [
    { "questionId": 1, "score": 2 },
    { "questionId": 2, "score": 1 },
    { "questionId": 3, "score": 2 },
    { "questionId": 4, "score": 1 },
    { "questionId": 5, "score": 2 },
    { "questionId": 6, "score": 0 },
    { "questionId": 7, "score": 1 },
    { "questionId": 8, "score": 2 },
    { "questionId": 9, "score": 1 },
    { "questionId": 10, "score": 0 }
  ]
}
```

**Required Fields:**
- `studentName` (string) - Student's full name
- `class` (string) - Class/Grade (e.g., "Year 7", "Grade 6")
- `teacherName` (string) - Assessing teacher's name
- `answers` (array) - Array of 10 scored answers

**Answer Format:**
- `questionId` (number) - Question number (1-10)
- `score` (number) - Score value: 0, 1, or 2 only

**Response Status:** `201 Created`

**Response Body:**
```json
{
  "message": "Assessment saved successfully",
  "assessment": {
    "_id": "507f1f77bcf86cd799439011",
    "studentName": "John Doe",
    "class": "Year 7",
    "teacherName": "Mrs. Smith",
    "answers": [
      { "questionId": 1, "score": 2 },
      { "questionId": 2, "score": 1 },
      { ... },
      { "questionId": 10, "score": 0 }
    ],
    "totalScore": 12,
    "level": "Advanced",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Missing required fields"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/assessments \
  -H "Content-Type: application/json" \
  -d '{
    "studentName": "John Doe",
    "class": "Year 7",
    "teacherName": "Mrs. Smith",
    "answers": [
      {"questionId": 1, "score": 2},
      {"questionId": 2, "score": 1},
      {"questionId": 3, "score": 2},
      {"questionId": 4, "score": 1},
      {"questionId": 5, "score": 2},
      {"questionId": 6, "score": 0},
      {"questionId": 7, "score": 1},
      {"questionId": 8, "score": 2},
      {"questionId": 9, "score": 1},
      {"questionId": 10, "score": 0}
    ]
  }'
```

---

### 2. Get All Assessments

**Endpoint:** `GET /api/assessments`

**Description:** Retrieve all saved assessments (sorted by newest first)

**Query Parameters:** None

**Response Status:** `200 OK`

**Response Body:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "studentName": "John Doe",
    "class": "Year 7",
    "teacherName": "Mrs. Smith",
    "totalScore": 12,
    "level": "Advanced",
    "answers": [...],
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "studentName": "Mary Smith",
    "class": "Year 7",
    "teacherName": "Mr. Johnson",
    "totalScore": 18,
    "level": "Advanced",
    "answers": [...],
    "createdAt": "2024-01-15T09:15:00.000Z"
  }
]
```

**cURL Example:**
```bash
curl http://localhost:5000/api/assessments
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:5000/api/assessments');
const assessments = await response.json();
console.log(assessments);
```

---

### 3. Get Single Assessment

**Endpoint:** `GET /api/assessments/:id`

**Description:** Retrieve a specific assessment by ID

**Path Parameters:**
- `id` (string) - MongoDB ObjectId of assessment

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "studentName": "John Doe",
  "class": "Year 7",
  "teacherName": "Mrs. Smith",
  "answers": [
    { "questionId": 1, "score": 2 },
    { ... }
  ],
  "totalScore": 12,
  "level": "Advanced",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Assessment not found"
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/assessments/507f1f77bcf86cd799439011
```

---

### 4. Delete Assessment

**Endpoint:** `DELETE /api/assessments/:id`

**Description:** Delete an assessment by ID

**Path Parameters:**
- `id` (string) - MongoDB ObjectId of assessment

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "message": "Assessment deleted successfully"
}
```

**Error Response (404):**
```json
{
  "error": "Assessment not found"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:5000/api/assessments/507f1f77bcf86cd799439011
```

---

### 5. Health Check

**Endpoint:** `GET /api/health`

**Description:** Check if server is running

**Response Status:** `200 OK`

**Response Body:**
```json
{
  "status": "Server is running"
}
```

**cURL Example:**
```bash
curl http://localhost:5000/api/health
```

---

## Scoring System

### Score Values
- **0** = No (Not demonstrated)
- **1** = Partly (Partially demonstrated)
- **2** = Yes (Fully demonstrated)

### Total Score Calculation
```
Total Score = Sum of all 10 question scores
Minimum: 0 (all answers = 0)
Maximum: 20 (all answers = 2)
```

### Level Assignment
```
0-5 points   → Beginner
6-10 points  → Intermediate
11-20 points → Advanced
```

---

## Assessment Questions

1. Can respond to greeting?
2. Can follow instructions?
3. Can speak basic English?
4. Can read basic text?
5. Can write simple sentences?
6. Can introduce themselves?
7. Can ask simple questions?
8. Can understand common words?
9. Can participate in class?
10. Can communicate basic needs?

---

## HTTP Status Codes

| Code | Meaning | Scenario |
|------|---------|----------|
| 200  | OK | Successful GET/DELETE |
| 201  | Created | Assessment successfully created |
| 400  | Bad Request | Missing/invalid fields in request |
| 404  | Not Found | Assessment ID doesn't exist |
| 500  | Server Error | Server-side error, check logs |

---

## Error Handling

### Common Errors

**Missing required fields:**
```json
{
  "error": "Missing required fields"
}
```

**Assessment not found:**
```json
{
  "error": "Assessment not found"
}
```

**Server error:**
```json
{
  "error": "error message from server"
}
```

---

## Testing with Different Tools

### Using Postman

1. **Create Assessment:**
   - Method: POST
   - URL: http://localhost:5000/api/assessments
   - Headers: Content-Type: application/json
   - Body: (raw JSON)
   ```json
   {
     "studentName": "John",
     "class": "Year 7",
     "teacherName": "Mrs Smith",
     "answers": [
       {"questionId": 1, "score": 2},
       {"questionId": 2, "score": 1},
       {"questionId": 3, "score": 2},
       {"questionId": 4, "score": 1},
       {"questionId": 5, "score": 2},
       {"questionId": 6, "score": 0},
       {"questionId": 7, "score": 1},
       {"questionId": 8, "score": 2},
       {"questionId": 9, "score": 1},
       {"questionId": 10, "score": 0}
     ]
   }
   ```

### Using JavaScript Fetch

```javascript
// Create assessment
const createAssessment = async () => {
  const response = await fetch('http://localhost:5000/api/assessments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      studentName: 'John Doe',
      class: 'Year 7',
      teacherName: 'Mrs. Smith',
      answers: [
        {questionId: 1, score: 2},
        {questionId: 2, score: 1},
        {questionId: 3, score: 2},
        {questionId: 4, score: 1},
        {questionId: 5, score: 2},
        {questionId: 6, score: 0},
        {questionId: 7, score: 1},
        {questionId: 8, score: 2},
        {questionId: 9, score: 1},
        {questionId: 10, score: 0}
      ]
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Get all assessments
const getAllAssessments = async () => {
  const response = await fetch('http://localhost:5000/api/assessments');
  const data = await response.json();
  console.log(data);
};

// Delete assessment
const deleteAssessment = async (id) => {
  const response = await fetch(`http://localhost:5000/api/assessments/${id}`, {
    method: 'DELETE'
  });
  
  const data = await response.json();
  console.log(data);
};
```

### Using Axios

```javascript
// Create assessment
axios.post('http://localhost:5000/api/assessments', {
  studentName: 'John Doe',
  class: 'Year 7',
  teacherName: 'Mrs. Smith',
  answers: [...]
}).then(res => console.log(res.data));

// Get all assessments
axios.get('http://localhost:5000/api/assessments')
  .then(res => console.log(res.data));

// Delete assessment
axios.delete(`http://localhost:5000/api/assessments/${id}`)
  .then(res => console.log(res.data));
```

---

## Rate Limiting

❌ **No rate limiting** - local development

---

## Pagination

❌ **No pagination** - returns all assessments

Add in future if needed:
```
GET /api/assessments?page=1&limit=20
```

---

## Filtering & Search

❌ **Not implemented** - can be added

Potential future endpoints:
```
GET /api/assessments?studentName=John
GET /api/assessments?teacherName=Smith
GET /api/assessments?class=Year7
GET /api/assessments?minScore=15&maxScore=20
```

---

## Sorting

Current: Assessments sorted by `createdAt` (newest first)

Future improvements:
```
GET /api/assessments?sort=-totalScore
GET /api/assessments?sort=studentName
```

---

## Data Types Reference

```javascript
// String: "John Doe"
// Number: 2, 15, 20
// Integer: 0, 1, 2
// Array: [{}, {}, {}]
// Object: { prop: value }
// Date: "2024-01-15T10:30:00.000Z" (ISO 8601)
// ObjectId: "507f1f77bcf86cd799439011"
```

---

## CORS Configuration

✅ **CORS Enabled** for all origins (development)

```javascript
app.use(cors());
```

Production: Restrict to specific domains
```javascript
app.use(cors({
  origin: 'https://yourdomain.com'
}));
```

---

## Request Validation Rules

| Field | Type | Length | Required | Validation |
|-------|------|--------|----------|-----------|
| studentName | String | 1-100 | Yes | Not empty |
| class | String | 1-50 | Yes | Not empty |
| teacherName | String | 1-100 | Yes | Not empty |
| answers | Array | 10 items | Yes | Exactly 10 |
| questionId | Number | - | Yes | 1-10 |
| score | Number | - | Yes | 0, 1, or 2 |

---

## Database Details

**Collection Name:** assessments

**Database:** student-assessment

**Connection:** MongoDB Mongoose

---

## API Version

**Current Version:** 1.0

**Base Path:** /api

**Prefix:** /api/assessments

---

## Changelog

### v1.0 (Initial Release)
- POST /api/assessments - Create
- GET /api/assessments - List all
- GET /api/assessments/:id - Get one
- DELETE /api/assessments/:id - Delete
- Auto score calculation
- Auto level assignment
- Timestamp tracking

---

## Support

For issues:
1. Check server is running on port 5000
2. Verify MongoDB is connected
3. Check request format matches documentation
4. Review server logs for errors
5. Test endpoint with cURL first

---

**API Documentation Complete! 📡**
