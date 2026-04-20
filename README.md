# Teacher Assessment Web App

A simple, user-friendly web application for teachers to conduct student language assessments and track results.

## 🎯 Features

✅ **Assessment Form** - Clean form to evaluate students  
✅ **Scoring System** - Simple 0-1-2 scoring (No, Partly, Yes)  
✅ **Auto Score Calculation** - Automatic total score and level computation  
✅ **Assessment List** - View all saved assessments in a table  
✅ **Responsive Design** - Works on desktop and tablets  
✅ **MongoDB Persistence** - All data saved in database  

## 📊 Architecture

```
StudentAssessment/
├── backend/              # Node.js + Express server
│   ├── models/          # Mongoose schemas
│   ├── controllers/      # Business logic
│   ├── routes/          # API endpoints
│   ├── server.js        # Main server file
│   └── package.json
│
└── frontend/            # React app
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/       # Page components
    │   ├── services/    # API communication
    │   └── App.js
    ├── public/          # Static files
    └── package.json
```

## 🛠️ Tech Stack

**Frontend:**
- React 18
- React Router DOM
- Tailwind CSS
- Axios

**Backend:**
- Node.js
- Express
- MongoDB + Mongoose
- CORS

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** running locally or a connection string
  - macOS: `brew install mongodb-community`
  - Or use MongoDB Atlas cloud database
- **npm** or **yarn** package manager

## 🚀 Installation & Setup

### 1. Setup MongoDB

#### Option A: Local MongoDB (macOS)
```bash
# Install MongoDB
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify it's running
mongosh
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update `.env` in backend folder

---

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start the server (with nodemon for development)
npm run dev

# Or without nodemon
npm start
```

The backend will run on **http://localhost:5000**

To verify it's working:
```bash
curl http://localhost:5000/api/health
```

---

### 3. Frontend Setup

```bash
# Open a new terminal and navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The frontend will open automatically at **http://localhost:3000**

If not, visit: **http://localhost:3000**

---

## 📝 Usage

### 1. **Create Assessment**
- Go to "📝 New Assessment" tab
- Fill in student details (Name, Class, Teacher)
- Answer all 10 assessment questions
- Click "💾 Save Assessment"
- Success message will appear

### 2. **View Assessments**
- Go to "📋 View Records" tab
- See table with all saved assessments
- View student name, class, teacher, score, level, and date
- Delete assessments using the Delete button

### 3. **Score Levels**
- **0-5 points** → Beginner (Red badge)
- **6-10 points** → Intermediate (Yellow badge)
- **11-20 points** → Advanced (Green badge)

---

## 🔌 API Endpoints

### Assessment Endpoints

**POST /api/assessments** - Create new assessment
```json
{
  "studentName": "John Doe",
  "class": "Year 7",
  "teacherName": "Mrs. Smith",
  "answers": [
    { "questionId": 1, "score": 2 },
    { "questionId": 2, "score": 1 },
    { "questionId": 3, "score": 2 }
  ]
}
```

**GET /api/assessments** - Get all assessments
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "studentName": "John Doe",
    "class": "Year 7",
    "teacherName": "Mrs. Smith",
    "totalScore": 15,
    "level": "Advanced",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

**GET /api/assessments/:id** - Get single assessment
**DELETE /api/assessments/:id** - Delete assessment

---

## 🎨 UI Overview

### Assessment Form Page
- Clean centered form with gradient background
- Student details section (Name, Class, Teacher)
- 10 assessment questions with radio buttons
- Real-time score calculation
- Success/error messages
- Submit button

### Assessment List Page
- Responsive data table
- Columns: Student Name, Class, Teacher, Score, Level, Date, Action
- Color-coded level badges
- Delete functionality
- Refresh button
- Total count display

---

## 🗄️ Database Schema

### Assessment Collection

```javascript
{
  _id: ObjectId,
  studentName: String,
  class: String,
  teacherName: String,
  answers: [
    {
      questionId: Number,
      score: Number (0-2)
    }
  ],
  totalScore: Number,
  level: String ("Beginner" | "Intermediate" | "Advanced"),
  createdAt: Date
}
```

---

## 📝 Assessment Questions

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

## ⚙️ Configuration

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/student-assessment
PORT=5000
```

### Frontend (proxy in package.json)
```json
"proxy": "http://localhost:5000"
```

---

## 🐛 Troubleshooting

### Issue: Cannot connect to MongoDB
**Solution:**
- Check if MongoDB is running: `brew services list`
- Start MongoDB: `brew services start mongodb-community`
- Verify connection string in `.env`

### Issue: Port 5000 already in use
**Solution:**
- Kill the process: `lsof -ti:5000 | xargs kill -9`
- Or change PORT in `.env`

### Issue: CORS error
**Solution:**
- Ensure backend is running on port 5000
- Check proxy setting in frontend `package.json`

### Issue: Frontend cannot connect to backend
**Solution:**
- Verify backend is running: `curl http://localhost:5000/api/health`
- Check API URL in `src/services/api.js`
- Rest browser cache and restart both servers

### Issue: MongoDB connection timeout
**Solution:**
- For MongoDB Atlas, whitelist your IP in network access
- Check internet connection
- Verify connection string in `.env`

---

## 🚀 Deployment

### Deploy Backend (Heroku)
```bash
cd backend
npm install -g heroku
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_uri
git push heroku main
```

### Deploy Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Upload build folder to Vercel/Netlify
```

---

## 📚 Project Structure Details

### Backend Files

- **server.js** - Express app initialization, middleware setup, MongoDB connection
- **models/Assessment.js** - Mongoose schema for assessments
- **controllers/assessmentController.js** - CRUD logic and score calculation
- **routes/assessmentRoutes.js** - API route definitions

### Frontend Files

- **App.js** - Main React component with routing
- **components/Navbar.js** - Navigation bar
- **pages/AssessmentForm.js** - Assessment form page with validation
- **pages/AssessmentList.js** - List view of all assessments
- **services/api.js** - Axios API calls
- **index.css** - Global styles with Tailwind
- **tailwind.config.js** - Tailwind configuration

---

## 💡 Features Explanation

### Score Calculation
- Each question has 3 options: 0 (No), 1 (Partly), 2 (Yes)
- Total score = sum of all answers
- Max score = 20 (10 questions × 2 points)

### Level Assignment
- Automatic based on total score
- Used for quick assessment of student proficiency
- Displayed as colored badges for visual clarity

### Data Persistence
- All assessments saved in MongoDB
- Timestamps automatically added
- Data survives server restarts

---

## 🎓 Teaching Tips

- Use the form to assess students periodically
- Compare level changes over time
- Identify areas for improvement
- Track student progress with multiple assessments

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Verify all dependencies are installed
3. Ensure MongoDB is running
4. Check server logs for detailed errors
5. Restart both frontend and backend servers

---

## 📄 License

This project is open source and free to use.

---

## ✨ Future Enhancements (Optional)

- User authentication
- Export to Excel/PDF
- Charts and analytics
- Multiple assessment templates
- Student profiles
- Parent notifications
- Mobile app
- Multi-language support

---

**Happy Teaching! 🎉**
