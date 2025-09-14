require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const passport = require("passport");
let GoogleStrategy;
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  GoogleStrategy = require("passport-google-oauth20").Strategy;
}
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
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // React dev server
    credentials: true
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

// Connect to MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/x-clone")
  .then(() => {
    console.log("Connected to MongoDB");
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
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: "mongodb://127.0.0.1:27017/x-clone",
      ttl: 24 * 60 * 60, // 1 day
    }),
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (GoogleStrategy) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (!user) {
            // Create new user if doesn't exist
            user = new User({
              username: profile.displayName.toLowerCase().replace(/\s+/g, ""),
              email: profile.emails[0].value,
              password: crypto.randomBytes(32).toString("hex"), // Generate random password
              profilePhoto: {
                url: "https://res.cloudinary.com/dkqd9ects/image/upload/v1747571510/profile_offakc.png",
                filename: "profile_images",
              },
              coverPhoto: {
                url: "https://res.cloudinary.com/dkqd9ects/image/upload/v1747571508/cover_image_hnvoqn.webp",
                filename: "profile_covers",
              },
            });
            await user.save();

            // Find a random user to follow (excluding the new user)
            const randomUser = await User.aggregate([
              { $match: { _id: { $ne: user._id } } },
              { $sample: { size: 1 } },
            ]);

            if (randomUser && randomUser.length > 0) {
              // Add random user to following list
              user.following.push(randomUser[0]._id);
              // Add new user to random user's followers list
              await User.findByIdAndUpdate(randomUser[0]._id, {
                $push: { followers: user._id },
              });

              // Save the new user with updated following list
              await user.save();
            }
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Google Auth Routes (only if GoogleStrategy is enabled)
if (GoogleStrategy) {
  app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
      res.redirect("/");
    }
  );
}


// Authentication middleware (exported for use in routes)
const isApiRequest = (req) => req.headers.accept && req.headers.accept.includes('application/json');

const isAuthenticated = (req, res, next) => {
  if (req.path === "/explore") {
    return next(); // Allow access to the explore page without authentication
  }
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  if (req.session && req.session.userId) {
    return next();
  }
  if (isApiRequest(req)) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.redirect("/login");
};

module.exports.isAuthenticated = isAuthenticated;

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

app.use(
  cors({
    origin: "http://localhost:5173", // React dev server
    credentials: true,
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

// Catch-all route for 404
app.use((req, res) => {
  res.status(404).json({ error: "Page not found" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
