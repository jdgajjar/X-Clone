# X-Clone Authentication & Deployment Guide

This guide helps you fix authentication errors when deploying your X-Clone project.

## 🔍 Common Authentication Issues

### 1. Missing Environment Variables
**Problem**: Authentication fails because environment variables are not set properly.

**Solution**: Ensure all required environment variables are configured:

```bash
# Backend (.env)
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/x-clone
SESSION_SECRET=your-ultra-secure-session-secret
JWT_SECRET=your-jwt-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL_PROD=https://your-deployed-frontend.com
BACKEND_URL_PROD=https://your-deployed-backend.com
```

### 2. Google OAuth Configuration
**Problem**: Google OAuth fails with "redirect_uri_mismatch" or similar errors.

**Solution**: 
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Update your OAuth 2.0 Client IDs with production callback URLs:
   - Development: `http://localhost:3000/auth/google/callback`
   - Production: `https://your-backend-domain.com/auth/google/callback`

### 3. CORS Issues
**Problem**: Frontend can't communicate with backend due to CORS errors.

**Solution**: The updated server.js now handles CORS properly for both development and production:
```javascript
// Supports multiple origins
origin: [frontendURL, 'http://localhost:5173']
credentials: true
```

### 4. Session/Cookie Issues in Production
**Problem**: Sessions don't persist in production, users get logged out.

**Solution**: Updated session configuration handles HTTPS:
```javascript
cookie: {
  secure: isProduction, // HTTPS only in production
  sameSite: isProduction ? 'none' : 'lax'
}
```

### 5. Database Connection Issues
**Problem**: Can't connect to MongoDB in production.

**Solution**: Use environment-specific MongoDB URIs:
```javascript
const mongoURI = process.env.NODE_ENV === 'production' 
  ? process.env.MONGODB_URI_PROD 
  : process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/x-clone";
```

## 🚀 Deployment Steps

### 1. Use the Deployment Script
Run the interactive deployment configuration:
```bash
node deploy.js
```

This will generate production environment files with your specific configuration.

### 2. Manual Setup Alternative

#### Backend Deployment:
1. Copy your project to your server
2. Install dependencies: `npm install`
3. Set environment variables (see list above)
4. Run: `npm start`

#### Frontend Deployment:
1. Update `.env.production` with your backend URL
2. Build the project: `npm run build`
3. Deploy the `dist` folder to your hosting service

### 3. Platform-Specific Instructions

#### Vercel Deployment:
```bash
# Backend
vercel --prod
# Add environment variables in Vercel dashboard

# Frontend
npm run build
vercel --prod
```

#### Railway Deployment:
```bash
# Backend
railway login
railway new
railway up
# Add environment variables in Railway dashboard
```

#### Netlify + Heroku:
```bash
# Backend (Heroku)
heroku create your-app-name
git push heroku main
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI_PROD=your-mongodb-uri
# ... other env vars

# Frontend (Netlify)
npm run build
# Deploy dist folder to Netlify
# Set VITE_API_URL in Netlify environment variables
```

## 🔧 Testing Authentication

### 1. Local Testing:
```bash
# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
cd react
npm run dev
```

### 2. Production Testing Checklist:
- [ ] Google OAuth login works
- [ ] Regular email/password login works
- [ ] Sessions persist across page refreshes
- [ ] API calls work from frontend to backend
- [ ] Password reset emails are sent (if configured)
- [ ] CORS doesn't block requests

## 🛠️ Troubleshooting

### Debug Mode:
Add to your backend `.env`:
```
DEBUG=true
```

### Check Logs:
- Browser Console (F12) for frontend errors
- Server logs for backend errors
- Platform-specific logs (Vercel, Railway, etc.)

### Common Error Messages:

1. **"CORS error"**: Check CORS configuration and environment URLs
2. **"Authentication failed"**: Check Google OAuth credentials and callback URLs
3. **"Session store error"**: Check MongoDB connection string
4. **"Invalid token"**: Check JWT secret configuration
5. **"Email send failed"**: Check email credentials and configuration

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test authentication endpoints directly with curl/Postman
4. Check platform-specific logs

## 🔒 Security Considerations

1. **Never commit real credentials** to version control
2. **Use strong, unique secrets** for JWT and sessions
3. **Enable HTTPS** in production
4. **Regularly rotate** OAuth secrets and API keys
5. **Monitor** authentication logs for suspicious activity

## 📝 Environment Variable Template

Create a `.env.example` file for team members:
```bash
# Copy this to .env and fill in your values

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/x-clone
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/x-clone

# Secrets
SESSION_SECRET=generate-a-strong-secret-key
JWT_SECRET=generate-another-strong-secret

# Email (optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# URLs
FRONTEND_URL=http://localhost:5173
FRONTEND_URL_PROD=https://your-frontend-domain.com
BACKEND_URL=http://localhost:3000
BACKEND_URL_PROD=https://your-backend-domain.com

# Environment
NODE_ENV=development
PORT=3000
```