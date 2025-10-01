# Render.com Deployment Guide for X-Clone

This guide will help you deploy your X-Clone application to Render.com without Google OAuth.

## Prerequisites

1. A Render.com account
2. A MongoDB Atlas account (for production database)
3. Your application code pushed to GitHub

## Backend Deployment (Node.js Service)

### 1. Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `x-clone-backend` (or your preferred name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2. Environment Variables

Set the following environment variables in Render dashboard:

```
NODE_ENV=production
PORT=10000
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/x-clone
SESSION_SECRET=your-ultra-secure-session-secret-min-32-chars
JWT_SECRET=your-jwt-secret-key-min-32-chars
CLOUD_NAME=dkqd9ects
CLOUD_API_KEY=819237941854538
CLOUD_API_SECRET=ifyGR1x0Y4qu4W8TNa5hh82rLZc
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL_PROD=https://your-frontend-app.onrender.com
BACKEND_URL_PROD=https://your-backend-app.onrender.com
```

### 3. Important Notes

- Replace `your-backend-app` and `your-frontend-app` with your actual Render service names
- Generate strong secrets for SESSION_SECRET and JWT_SECRET (minimum 32 characters)
- Update MongoDB connection string with your Atlas credentials

## Frontend Deployment (Static Site)

### 1. Create New Static Site

1. In Render dashboard, click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure the site:
   - **Name**: `x-clone-frontend`
   - **Root Directory**: `react`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `react/dist`

### 2. Environment Variables

Set the following environment variable:

```
VITE_API_URL=https://your-backend-app.onrender.com
```

Replace `your-backend-app` with your actual backend service name.

## Post-Deployment Steps

### 1. Update CORS Configuration

After deployment, update your backend's CORS configuration in `server.js`:

```javascript
const allowedOrigins = [
  'https://your-frontend-app.onrender.com', // Your actual frontend URL
  'http://localhost:5173', // Keep for development
  // Add any other domains you need
].filter(Boolean);
```

### 2. Test Authentication

1. Visit your frontend URL
2. Try registering a new account
3. Test login functionality
4. Verify session persistence

## Troubleshooting

### Common Issues and Solutions

#### 1. 401 Authentication Errors

- **Problem**: Users get 401 errors after login
- **Solutions**:
  - Verify SESSION_SECRET and JWT_SECRET are set
  - Check CORS configuration includes your frontend domain
  - Ensure HTTPS is enabled in production

#### 2. CORS Errors

- **Problem**: Frontend can't communicate with backend
- **Solutions**:
  - Update CORS allowedOrigins with your actual Render URLs
  - Verify FRONTEND_URL_PROD and BACKEND_URL_PROD are correct
  - Check that credentials: true is set in CORS config

#### 3. Database Connection Errors

- **Problem**: Can't connect to MongoDB
- **Solutions**:
  - Verify MONGODB_URI_PROD connection string
  - Check MongoDB Atlas network access settings
  - Ensure database user has proper permissions

#### 4. Session Issues

- **Problem**: Users get logged out frequently
- **Solutions**:
  - Check session store configuration
  - Verify cookie settings for production
  - Ensure SESSION_SECRET is properly set

### Debug Mode

To enable debug logging, add this environment variable:

```
DEBUG=true
```

## Security Checklist

- [ ] Strong SESSION_SECRET (32+ characters)
- [ ] Strong JWT_SECRET (32+ characters)
- [ ] HTTPS enabled (automatic on Render)
- [ ] CORS properly configured
- [ ] Database credentials secure
- [ ] No sensitive data in client-side code

## Performance Tips

1. **Enable Gzip Compression**: Render enables this automatically
2. **Use Environment Variables**: Never hardcode URLs or secrets
3. **Database Indexing**: Add proper indexes to MongoDB collections
4. **Session Management**: Configure session TTL appropriately

## Monitoring

- Check Render logs for errors: Dashboard → Service → Logs
- Monitor database performance in MongoDB Atlas
- Set up uptime monitoring for your services

## Support

If you encounter issues:

1. Check Render logs first
2. Verify all environment variables are set
3. Test authentication endpoints directly
4. Check MongoDB Atlas logs

Remember to update your frontend and backend URLs in the environment variables with your actual Render service names!