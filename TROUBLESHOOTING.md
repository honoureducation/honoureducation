# 🔧 Troubleshooting Guide

## Login Issues

### Problem: "Login not working" or "Network Error"

**Quick Fixes:**

1. **Check Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Should show: `Server running on port 5000`

2. **Check Frontend API URL**
   - Open `frontend/.env`
   - Ensure it says: `REACT_APP_API_URL=http://localhost:5000`

3. **Create Demo Users**
   ```bash
   cd backend
   node test-auth.js
   ```

4. **Test API Connection**
   - Open browser to: http://localhost:5000/api/health
   - Should show: `{"status":"Server is running"}`

### Demo Accounts

After running `node test-auth.js`, you'll have:

- **Admin:** `admin@academic-excellence.com` / `admin123`
- **Teacher:** `teacher@school.edu` / `teacher123`

### Common Issues

#### 1. Port Conflicts
- Backend runs on port 5000
- Frontend runs on port 3000
- Make sure nothing else is using these ports

#### 2. MongoDB Connection
- Check your `.env` file has the correct `MONGODB_URI`
- Ensure MongoDB Atlas allows connections from your IP

#### 3. CORS Errors
- Check browser console for CORS errors
- Backend CORS is set to allow all origins in development

#### 4. Token Issues
- Clear browser localStorage: `localStorage.clear()`
- Try logging in again

### Step-by-Step Debugging

1. **Start Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Test Backend Health**
   ```bash
   curl http://localhost:5000/api/health
   ```

3. **Create Users**
   ```bash
   node test-auth.js
   ```

4. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

5. **Check Browser Console**
   - Open DevTools (F12)
   - Look for any red errors
   - Check Network tab for failed requests

### Quick Start Script

Run this to start everything:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Still Having Issues?

1. **Clear Everything**
   ```bash
   # Clear browser data
   localStorage.clear()
   
   # Restart servers
   pkill -f "node"
   pkill -f "npm"
   ```

2. **Check Logs**
   - Backend console for MongoDB connection
   - Frontend console for API errors
   - Network tab for HTTP status codes

3. **Verify Environment**
   - Node.js version 16+
   - npm version 8+
   - MongoDB Atlas connection string correct

### Error Messages

| Error | Solution |
|-------|----------|
| "Network Error" | Check if backend is running on port 5000 |
| "Invalid email or password" | Use demo accounts or create new user |
| "CORS Error" | Restart backend server |
| "Token expired" | Clear localStorage and login again |
| "MongoDB connection error" | Check MONGODB_URI in .env file |

### Contact

If you're still having issues:
1. Check the browser console for errors
2. Check the backend console for errors
3. Verify all environment variables are set correctly