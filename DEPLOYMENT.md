# Academic Excellence Assessment Platform - Deployment Guide

## Render Deployment

This application is configured for deployment on Render.com with the following architecture:
- **Backend**: Node.js API service
- **Frontend**: Static React site
- **Database**: MongoDB Atlas or Render PostgreSQL

### Prerequisites

1. **GitHub Repository**: Push your code to GitHub
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **MongoDB Atlas** (recommended): Set up a free cluster at [mongodb.com](https://mongodb.com)

### Deployment Steps

#### Option 1: Automatic Deployment (Recommended)

1. **Connect GitHub to Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` file

2. **Configure Environment Variables**
   - Set `MONGODB_URI` to your MongoDB Atlas connection string
   - Other variables are configured automatically

#### Option 2: Manual Deployment

1. **Deploy Backend API**
   ```
   - Service Type: Web Service
   - Build Command: cd backend && npm install
   - Start Command: cd backend && npm start
   - Environment Variables:
     * NODE_ENV=production
     * MONGODB_URI=<your-mongodb-connection-string>
     * PORT=10000
   ```

2. **Deploy Frontend**
   ```
   - Service Type: Static Site
   - Build Command: cd frontend && npm install && npm run build
   - Publish Directory: frontend/build
   - Environment Variables:
     * REACT_APP_API_URL=<your-backend-url>
   ```

### Environment Variables

#### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student_assessment
NODE_ENV=production
PORT=10000
```

#### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-service.onrender.com
GENERATE_SOURCEMAP=false
```

### MongoDB Setup

1. **Create MongoDB Atlas Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a free cluster
   - Create a database user
   - Whitelist IP addresses (0.0.0.0/0 for Render)
   - Get connection string

2. **Database Configuration**
   - Database Name: `student_assessment`
   - Collections will be created automatically

### Post-Deployment

1. **Test the Application**
   - Visit your frontend URL
   - Test assessment creation and submission
   - Check backend health at `/api/health`

2. **Monitor Logs**
   - Check Render service logs for any issues
   - Monitor database connections

### Troubleshooting

#### Common Issues

1. **CORS Errors**
   - Ensure frontend URL is in backend CORS configuration
   - Check environment variables

2. **Database Connection**
   - Verify MongoDB URI format
   - Check network access in MongoDB Atlas

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json

4. **API Connection Issues**
   - Verify REACT_APP_API_URL is correct
   - Check network requests in browser dev tools

### Performance Optimization

1. **Frontend**
   - Images are optimized for web
   - Build includes minification
   - Static assets are cached

2. **Backend**
   - MongoDB connection pooling
   - CORS configured for production
   - Health check endpoint available

### Security

1. **Environment Variables**
   - Never commit .env files
   - Use Render's environment variable system

2. **Database**
   - Use MongoDB Atlas with authentication
   - Restrict IP access when possible

3. **CORS**
   - Configure specific origins in production
   - Avoid wildcard (*) origins

### Scaling

- **Render Free Tier**: Suitable for development and testing
- **Render Paid Plans**: For production with guaranteed uptime
- **Database**: MongoDB Atlas scales automatically

### Support

For deployment issues:
1. Check Render documentation
2. Review application logs
3. Test locally with production environment variables