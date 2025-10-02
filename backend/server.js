require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");
const methodOverride = require("method-override");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Import routes
const userRoutes = require("./routes/user.route");
const postRoutes = require("./routes/post.route");
const notificationRoutes = require("./routes/notification.route");

// Import models
const User = require("./models/User");
const Post = require("./models/Post");

// Cloudinary & multer
const { poststorage, profileImageStorage, profileCoverStorage } = require("./cloudconflic");
const multer = require("multer");
const uploadPost = multer({ storage: poststorage });
const uploadProfileImage = multer({ storage: profileImageStorage });
const uploadProfileCover = multer({ storage: profileCoverStorage });

// Express setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST"]
  }
});
app.set("io", io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/x-clone";
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Session
const sessionSecret = process.env.SESSION_SECRET || "secret";
const sessionStore = MongoStore.create({ mongoUrl: mongoURI });
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: { maxAge: 7*24*60*60*1000, httpOnly: true }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session?.userId) return next();
  if (req.headers.accept?.includes("application/json")) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.redirect("/login");
};
module.exports.isAuthenticated = isAuthenticated;

// Socket.io connection
io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    if (userId) socket.join(userId);
  });
  socket.on("sendMessage", (data) => {
    if (data?.receiverId) io.to(data.receiverId).emit("newMessage", data.message);
  });
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

// Serve React build
const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

// SPA fallback for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
