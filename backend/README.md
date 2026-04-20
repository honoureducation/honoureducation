# Backend Setup Guide

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Make sure MongoDB is running
# Terminal 1: Start MongoDB (if local)
mongod

# 3. Terminal 2: Start backend server
npm run dev
```

The backend server will run on **http://localhost:5000**

## Environment Variables

The `.env` file is already configured:

```env
MONGODB_URI=mongodb://localhost:27017/student-assessment
PORT=5000
```

### For MongoDB Atlas (Cloud)

If using MongoDB Atlas instead of local MongoDB:

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `.env`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-assessment
PORT=5000
```

## Project Structure

```
backend/
├── models/
│   └── Assessment.js          # MongoDB schema
├── controllers/
│   └── assessmentController.js # Business logic
├── routes/
│   └── assessmentRoutes.js     # API routes
├── server.js                  # Main server
├── package.json
├── .env                       # Environment variables
└── .gitignore
```

## API Endpoints

### POST /api/assessments
Create a new assessment

**Request:**
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

**Response:**
```json
{
  "message": "Assessment saved successfully",
  "assessment": {
    "_id": "507f1f77bcf86cd799439011",
    "studentName": "John Doe",
    "class": "Year 7",
    "teacherName": "Mrs. Smith",
    "totalScore": 12,
    "level": "Advanced",
    "answers": [...],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### GET /api/assessments
Get all assessments (sorted by newest first)

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "studentName": "John Doe",
    "class": "Year 7",
    "teacherName": "Mrs. Smith",
    "totalScore": 12,
    "level": "Advanced",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

### GET /api/assessments/:id
Get single assessment by ID

### DELETE /api/assessments/:id
Delete assessment by ID

### GET /api/health
Health check endpoint

```json
{ "status": "Server is running" }
```

## Dependencies

- **express** - Web server framework
- **mongoose** - MongoDB object modeling
- **cors** - Enable cross-origin requests
- **dotenv** - Load environment variables
- **nodemon** - Auto-reload server during development

## MongoDB Schema

```javascript
Assessment {
  _id: ObjectId,
  studentName: String (required),
  class: String (required),
  teacherName: String (required),
  answers: [
    {
      questionId: Number,
      score: Number (0, 1, or 2)
    }
  ],
  totalScore: Number (calculated),
  level: String ("Beginner" | "Intermediate" | "Advanced"),
  createdAt: Date (automatic)
}
```

## Testing API with cURL

```bash
# Get all assessments
curl http://localhost:5000/api/assessments

# Get health status
curl http://localhost:5000/api/health

# Create assessment
curl -X POST http://localhost:5000/api/assessments \
  -H "Content-Type: application/json" \
  -d '{"studentName":"John","class":"Year 7","teacherName":"Mrs Smith","answers":[{"questionId":1,"score":2},{"questionId":2,"score":1},{"questionId":3,"score":2},{"questionId":4,"score":1},{"questionId":5,"score":2},{"questionId":6,"score":0},{"questionId":7,"score":1},{"questionId":8,"score":2},{"questionId":9,"score":1},{"questionId":10,"score":0}]}'

# Delete assessment
curl -X DELETE http://localhost:5000/api/assessments/507f1f77bcf86cd799439011
```

## Score Calculation

The backend automatically:
1. Sums all question scores
2. Assigns level based on total:
   - 0-5 → Beginner
   - 6-10 → Intermediate
   - 11+ → Advanced

## Error Handling

- 400 Bad Request - Missing required fields
- 404 Not Found - Assessment not found
- 500 Internal Server Error - Server error

All errors return JSON with error message.

## Tips

- Install MongoDB locally or use MongoDB Atlas
- Use Postman or Insomnia to test API
- Check server logs for debugging
- Never commit `.env` file (already in .gitignore)

---

**Server ready! 🚀**
