# 🚀 QUICK START GUIDE

## ⚡ 5-Minute Setup

### Step 1: Prerequisites (Do Once)

```bash
# Install Node.js (if not already installed)
# Visit: https://nodejs.org/

# Install MongoDB (macOS)
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify MongoDB is running
mongosh
# Type: exit
```

---

### Step 2: Backend Setup

```bash
# Open Terminal 1 and run:
cd StudentAssessment/backend

# Install dependencies
npm install

# Start server
npm run dev
```

✅ You should see: `Server running on http://localhost:5000`

---

### Step 3: Frontend Setup

```bash
# Open Terminal 2 (NEW TERMINAL) and run:
cd StudentAssessment/frontend

# Install dependencies
npm install

# Start React app
npm start
```

✅ Browser will open automatically at `http://localhost:3000`

---

## 🎯 You're Done!

The app is now running! 

### What to do next:

1. **Create Assessment**
   - Click "📝 New Assessment"
   - Fill in student details
   - Answer all 10 questions
   - Click "💾 Save Assessment"

2. **View Assessments**
   - Click "📋 View Records"
   - See all saved assessments
   - Delete if needed

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Try again
npm run dev
```

### MongoDB connection failed
```bash
# Make sure MongoDB is running
brew services list

# Start it if needed
brew services start mongodb-community
```

### Frontend won't connect to backend
- Make sure backend is running (Terminal 1 shows server message)
- Try refreshing the page
- Check browser DevTools Console for errors

### Port 3000 already in use
```bash
# Kill process
lsof -i :3000 | xargs kill -9

# Restart
npm start
```

---

## 📚 Full Documentation

- See [README.md](./README.md) for complete guide
- See [backend/README.md](./backend/README.md) for API details
- See [frontend/README.md](./frontend/README.md) for UI details

---

## 🎨 UI Overview

### Form Page
```
┌─────────────────────────────────────┐
│  📚 TEACHER ASSESSMENT FORM          │
├─────────────────────────────────────┤
│ Student Details                     │
│ ├─ Student Name: [________]         │
│ ├─ Class: [________]                │
│ └─ Teacher Name: [________]         │
│                                     │
│ Assessment Questions                │
│ ├─ Question 1: ⭕ ⭕ ⭕            │
│ ├─ Question 2: ⭕ ⭕ ⭕            │
│ └─ ...                              │
│                                     │
│ Total Score: 15/20                  │
│ [💾 Save Assessment]                │
└─────────────────────────────────────┘
```

### List Page
```
┌──────────────────────────────────────┐
│  📋 ASSESSMENT RECORDS               │
├──────────────────────────────────────┤
│ Name    Class    Teacher    Score    │
├──────────────────────────────────────┤
│ John    Year 7   Mrs Smith  15/20    │
│ Mary    Year 7   Mrs Smith  18/20    │
│ ...                                  │
└──────────────────────────────────────┘
```

---

## 💡 Feature Overview

✅ **Assessment Form**
- Student details input (Name, Class, Teacher)
- 10 assessment questions
- Radio button scoring (0, 1, 2)
- Real-time score calculation
- Form validation
- Success/error messages

✅ **Score System**
- 0 = No → 0 points
- 1 = Partly → 1 point
- 2 = Yes → 2 points
- Total: 0-20 points

✅ **Levels**
- 0-5: Beginner (🔴 Red)
- 6-10: Intermediate (🟡 Yellow)
- 11-20: Advanced (🟢 Green)

✅ **Assessment List**
- View all saved assessments
- Table with sorting
- Delete functionality
- Refresh button
- Date/time display

---

## 🔧 Tech Stack

**Frontend:**
- ⚛️ React 18
- 🎨 Tailwind CSS
- 🗺️ React Router
- 📦 Axios

**Backend:**
- 🟢 Node.js + Express
- 📊 MongoDB + Mongoose
- 🔌 CORS enabled

---

## 📞 Common Commands

```bash
# Start everything (in separate terminals)
cd backend && npm run dev    # Terminal 1
cd frontend && npm start     # Terminal 2

# Stop servers
Ctrl + C

# Clear npm cache (if issues)
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## ✨ Tips

👉 Keep both terminals open while developing
👉 Changes auto-reload in the browser
👉 Check browser console (F12) for errors
👉 MongoDB must be running at all times
👉 Don't close either server until you're done

---

## 🎉 That's It!

You now have a fully functional Teacher Assessment Web App!

**Happy teaching! 📚**

---

For more detailed information, read the full [README.md](./README.md)
