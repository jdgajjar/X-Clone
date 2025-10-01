require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const multer = require("multer");
const os = require("os");
const fs = require("fs");
const methodOverride = require("method-override");
const cors = require("cors");

// Cloudinary storage
const {
  cloudinary,
  poststorage,
  profileImageStorage,
  profileCoverStorage,
  getProfileStorage,
} = require("./cloudconflic");

// Multer uploads
const uploadPost = multer({ storage: poststorage });
const uploadProfileImage = multer({ storage: profileImageStorage });
const uploadProfileCover = multer({ storage: profileCoverStorage });

// Routes
const userRoutes = require("./routes/user.route");
const postRoutes = require("./routes/post.route");
const notificationRoutes = require("./routes/notification.route");

// Models
const User = require("./models/User");
const Post = require("./models/Post");

// Express app
const app = express();

// --- SOCKET.IO SETUP ---
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

const frontendURL =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: [frontendURL, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) socket.join(userId);
  });

  socket.on("sendMessage", (data) => {
    if (data && data.receiverId) {
      io.to(data.receiverId).emit("newMessage", data.message);
      if (data.message && data.message.sender) {
        io.to(data.message.sender).emit("newMessage", data.message);
      }
    }
  });
});

// MongoDB connection
const mongoURI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URI_PROD
    : process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/x-clone";

mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log(`Connected to MongoDB`))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Session
const sessionSecret = process.env.SESSION_SECRET || "your-secret-key";
const sessionStore = MongoStore.create({
  mongoUrl: mongoURI,
  ttl: 24 * 60 * 60,
  crypto: { secret: sessionSecret },
});

sessionStore.on("error", (err) => console.error("Session store error:", err));

app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
    rolling: true,
  })
);

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if ([frontendURL, "http://localhost:5173"].includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// React frontend build (SPA)
const frontendBuildPath = path.join(__dirname, "../frontend/build");
app.use(express.static(frontendBuildPath));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(frontendBuildPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
