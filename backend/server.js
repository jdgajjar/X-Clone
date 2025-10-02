require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// Google OAuth removed - using session-based authentication only
const {
  cloudinary,
  poststorage,
  profileImageStorage,
  profileCoverStorage,
  getProfileStorage,
} = require("./cloudconflic");
const multer = require("multer");
const os = require("os");
const fs = require("fs");
const uploadPost = multer({ storage: poststorage });
// For profile image uploads
const uploadProfileImage = multer({ storage: profileImageStorage });
// For profile cover uploads
const uploadProfileCover = multer({ storage: profileCoverStorage });
const userRoutes = require("./routes/user.route");
const postRoutes = require("./routes/post.route");
const notificationRoutes = require("./routes/notification.route");
const methodOverride = require("method-override");
const cors = require("cors");


const app = express();


// --- SOCKET.IO SETUP ---
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
// Environment-based CORS configuration
const frontendURL = process.env.NODE_ENV === 'production' 
  ? process.env.FRONTEND_URL_PROD 
  : process.env.FRONTEND_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: [frontendURL, 'http://localhost:5173'], // Support both dev and prod URLs
    credentials: true,
    methods: ["GET", "POST"]
  }
});
// Make io available in controllers for real-time events
app.set('io', io);

// Socket.io connection
io.on('connection', (socket) => {
  // Join room for user (by userId)
  socket.on('join', (userId) => {
    if (userId) socket.join(userId);
  });

  // Forward message to receiver in real time
  socket.on('sendMessage', (data) => {
    // data: { message, receiverId }
    if (data && data.receiverId) {
      // Emit to both receiver and sender for cross-tab sync
      io.to(data.receiverId).emit('newMessage', data.message);
      if (data.message && data.message.sender) {
        io.to(data.message.sender).emit('newMessage', data.message);
      }
    }
  });
});

// Connect to MongoDB with environment-based URI
const mongoURI = process.env.NODE_ENV === 'production' 
  ? process.env.MONGODB_URI_PROD 
  : process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/x-clone";

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Connected to MongoDB (${process.env.NODE_ENV || 'development'})`);
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// User Schema
const User = require("./models/User");

// Import Post model
const Post = require("./models/Post");

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Session configuration optimized for Render.com deployment
const isProduction = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET || "your-secret-key";

// Create session store with better error handling
const sessionStore = MongoStore.create({
  mongoUrl: mongoURI,
  ttl: 24 * 60 * 60, // 1 day
  touchAfter: 24 * 3600, // Only update session once per day unless changed
  crypto: {
    secret: sessionSecret
  }
});

// Handle session store errors
sessionStore.on('error', (error) => {
  console.error('Session store error:', error);
});

app.use(
  session({
    secret: sessionSecret,
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: isProduction, // Use secure cookies in production (HTTPS only)
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for better user experience
      sameSite: isProduction ? 'none' : 'lax', // Allow cross-site cookies in production
    },
    rolling: true // Reset expiration on activity
  })
);

// Session-based authentication only (Google OAuth removed)

// Google OAuth removed - using session-based authentication only

// Google OAuth routes removed - using email/password authentication only


// Authentication middleware (exported for use in routes)
const isApiRequest = (req) => req.headers.accept && req.headers.accept.includes('application/json');

const isAuthenticated = (req, res, next) => {
  // Allow access to explore page without authentication
  if (req.path === "/explore") {
    return next();
  }
  
  // Check for session-based authentication
  if (req.session && req.session.userId) {
    return next();
  }
  
  // Check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
      req.user = { _id: decoded.userId, email: decoded.email };
      return next();
    } catch (error) {
      console.error('JWT verification failed:', error);
    }
  }
  
  // Not authenticated - handle based on request type
  if (isApiRequest(req)) {
    return res.status(401).json({ error: "Not authenticated. Please login first." });
  }
  res.redirect("/login");
};

module.exports.isAuthenticated = isAuthenticated;

// Create a transporter for sending emails with error handling
let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  console.warn('Email configuration missing - email features will be disabled');
}

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// Enhanced CORS configuration for Render.com deployment
const allowedOrigins = [
  frontendURL,
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL_PROD,
  // Add common Render.com patterns for your services
  'https://x-clone-frontend.onrender.com',
  'https://x-clone-frontend-*.onrender.com', // For preview deployments
  // Add any custom domain you might use
  process.env.CUSTOM_DOMAIN
].filter(Boolean); // Remove undefined values

// Add wildcard matching for Render.com subdomains
const isRenderOrigin = (origin) => {
  return origin && (
    origin.includes('.onrender.com') && 
    (origin.includes('x-clone-frontend') || origin.includes('your-app-name'))
  );
};

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or is a Render.com subdomain
      if (allowedOrigins.indexOf(origin) !== -1 || isRenderOrigin(origin)) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        console.log('Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
  })
);

// Store reset tokens temporarily (in production, use Redis or a database)
const resetTokens = new Map();

// Home route
app.get("/", async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const user = await User.findById(userId);
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "username name profilePhoto IsVerified")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "username name profilePhoto IsVerified",
        },
      })
      .lean();
    posts.forEach((post) => {
      if (userId) {
        post.isLiked = post.likes.some(
          (like) => like.toString() === userId.toString()
        );
      } else {
        post.isLiked = false;
      }
    });
    posts.forEach((post) => {
      if (post.author && typeof post.author.IsVerified === "undefined") {
        post.author.IsVerified = false;
      }
    });
    // DEBUG: Log userId and all users for troubleshooting
    console.log('userId:', userId);
    const allUsers = await User.find({}, 'username _id');
   
    // Always return all users except the current user, or all users if only one exists
    if (allUsers.length === 1) {
      randomusers = allUsers;
    } else {
      randomusers = await User.find({ _id: { $ne: userId } }, 'username name profilePhoto IsVerified');
      if (!randomusers || randomusers.length === 0) {
        randomusers = allUsers;
      }
    }
    // If no users found, return a hardcoded demo user for emergency fallback
    if (!randomusers || randomusers.length === 0) {
      randomusers = [{
        username: 'demo_user',
        name: 'Demo User',
        profilePhoto: { url: 'https://res.cloudinary.com/dkqd9ects/image/upload/v1747571510/profile_offakc.png' },
        IsVerified: true
      }];
    }
    // Always return all users (including current user) for demo/testing if nothing else works
    if (!randomusers || randomusers.length === 0) {
      randomusers = await User.find({}, 'username name profilePhoto IsVerified');
    }
   
    res.json({ user, posts, randomusers });
  } catch (error) {
    console.error("Error loading home:", error);
    res.status(500).json({ error: "Error loading home" });
  }
});

// Register user routes at root for /login, /register, etc.
app.use("/", userRoutes);
app.use("/", notificationRoutes);
// Register post routes at root for /new, /:id, etc.
app.use("/", postRoutes);

// Search users and posts (for AJAX and page render)
app.get("/user/search", async (req, res) => {
  const q = req.query.q?.trim();
  if (!q) {
    return res.json([]);
  }
  try {
    const users = await User.find({ username: { $regex: q, $options: "i" } })
      .limit(5)
      .select("username IsVerified");
    const posts = await Post.find({ content: { $regex: q, $options: "i" } })
      .limit(5)
      .select("content _id");
    const userResults = users.map((u) => ({
      type: "user",
      username: u.username,
      IsVerified: u.IsVerified,
    }));
    const postResults = posts.map((p) => ({
      type: "post",
      content: p.content,
      _id: p._id,
    }));
    const results = [...userResults, ...postResults];
    res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json([]);
  }
});

// Health check endpoint for Render.com deployment monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'X-Clone Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    api: 'X-Clone API',
    status: 'active',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Catch-all route for 404
app.use((req, res) => {
  res.status(404).json({ error: "Page not found" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
  console.log(`API status available at: http://localhost:${PORT}/api/status`);
});
