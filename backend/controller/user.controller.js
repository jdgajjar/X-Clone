// API: Get current user for React
const getCurrentUserApi = async (req, res) => {
  try {
    let user;
    if (req.user && req.user._id) {
      user = await User.findById(req.user._id).select('_id username email profilePhoto IsVerified');
    } else if (req.session.userId) {
      user = await User.findById(req.session.userId).select('_id username email profilePhoto IsVerified');
    }
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
};
// --- Chat Message APIs ---
const Message = require('../models/Message');

// Send a message
const sendMessage = async (req, res) => {
  try {
    const sender = req.user ? req.user._id : req.session.userId;
    const { receiver, content } = req.body;
    if (!receiver || !content) return res.status(400).json({ error: 'Receiver and content required' });
    // Block check: prevent messaging if either user has blocked the other
    const senderUser = await User.findById(sender);
    const receiverUser = await User.findById(receiver);
    if (!senderUser || !receiverUser) return res.status(404).json({ error: 'User not found' });
    if (
      senderUser.blockedUsers.includes(receiverUser._id) ||
      receiverUser.blockedUsers.includes(senderUser._id)
    ) {
      return res.status(403).json({ error: 'You cannot message this user.' });
    }
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get all messages between current user and another user
const getMessages = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const otherUserId = req.params.userId;
    if (!otherUserId) return res.status(400).json({ error: 'UserId required' });
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
// API: Get all users for React
const getAllUsersApi = async (req, res) => {
  try {
    // Also return blockedUsers and blockedBy for each user
    const users = await User.find({}, '_id username email profilePhoto IsVerified blockedUsers blockedBy');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
// API: Search users and posts for React search page
const searchUsersAndPosts = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ results: [] });

    // Search users by username only (case-insensitive, partial match)
    const userResults = await User.find({
      username: { $regex: q, $options: 'i' }
    })
      .select('_id username email profilePhoto IsVerified')
      .limit(10)
      .lean();
    const users = userResults.map(u => ({
      ...u,
      type: 'user',
    }));

    // Search posts by content (case-insensitive, partial match)
    const postResults = await Post.find({
      content: { $regex: q, $options: 'i' }
    })
      .select('_id content author createdAt')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    const posts = postResults.map(p => ({
      ...p,
      type: 'post',
    }));

    // Combine and return
    res.json({ results: [...users, ...posts] });
  } catch (err) {
    console.error('Search API error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// Passport removed - using session-based authentication only
// Google OAuth removed - using session-based authentication only
const { cloudinary, poststorage, profileImageStorage, profileCoverStorage, getProfileStorage } = require('../cloudconflic');
const multer = require('multer');
const os = require('os');
const fs = require('fs');
const uploadPost = multer({ storage: poststorage });
const uploadProfile = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, os.tmpdir()); // Use OS temp directory
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    }),
    fileFilter: (req, file, cb) => cb(null, true)
});
const methodOverride = require('method-override');
// FIX: Correct import path for User and Post models
const User = require('../models/User');
const Post = require('../models/Post');

// Store reset tokens temporarily (in production, use Redis or a database)
const resetTokens = new Map();

const getLogin = (req, res) => {
  if (req.session.userId) {
    res.status(200).json({ redirect: "/" });
  } else {
    res.json({ error: null });
  }
};

const postLogin = async (req, res) => {
  try {
    const { email, password, remember } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Set session
    req.session.userId = user._id;

    // If remember me is checked, set a longer session duration
    if (remember) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    // Generate JWT token for React frontend
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'defaultsecret',
      { expiresIn: '7d' }
    );
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An error occurred. Please try again." });
  }
};


const logout = (req, res) => {
  if (typeof req.logout === 'function') {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logged out" });
      });
    });
  } else {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out" });
    });
  }
};

const getRegister = (req, res) => {
  if (req.session.userId) {
    res.status(200).json({ redirect: "/" });
  } else {
    res.json({ error: null });
  }
};

const postRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      // If API request, return JSON
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        return res.status(409).json({ message: "Username or email already exists" });
      }
      // Otherwise, render error page
      return res.status(409).render("register", { error: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
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

    // Set session
    req.session.userId = user._id;
    // If API request, return JSON
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(201).json({ message: "Registration successful", user: { username: user.username, email: user.email } });
    }
    res.redirect("/");
  } catch (error) {
    console.error("Registration error:", error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ message: "An error occurred during registration" });
    }
    res.render("register", { error: "An error occurred during registration" });
  }
};

const getPremium =  async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const user = await User.findById(userId);
    // Fetch random users to suggest (for sidebar, if needed)
    const randomusers = await User.aggregate([
      { $match: { _id: { $ne: userId } } },
      { $sample: { size: 5 } },
      { $project: { username: 1, name: 1, profilePhoto: 1, IsVerified: 1 } },
    ]);

    // Calculate verificationExpiresAt if user is verified
    let verificationExpiresAt = null;
    if (user.IsVerified) {
      // Store the time when user was verified in session if not already set
      if (!req.session.verifiedAt) {
        req.session.verifiedAt = Date.now();
      }
      // 24 hours after verifiedAt
      verificationExpiresAt = req.session.verifiedAt + 24 * 60 * 60 * 1000;
      // If expired, clear session and set IsVerified to false
      if (Date.now() > verificationExpiresAt) {
        user.IsVerified = false;
        await user.save();
        req.session.verifiedAt = null;
        verificationExpiresAt = null;
      }
    } else {
      req.session.verifiedAt = null;
    }

    res.json({ user, randomusers, verificationExpiresAt });
  } catch (error) {
    console.error("Error loading premium page:", error);
    res.status(500).json({ error: "Failed to load premium page." });
  }
};

const postPremium =  async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).render("error", { error: "User not found" });
    }
    // Update user to premium (verified)
    user.IsVerified = true;
    await user.save();
    console.log("User temporarily verified:", user);

    // Set a timer to revert IsVerified after 2 minutes (120000 ms)
    setTimeout(() => {
      User.findById(userId)
        .then((tempUser) => {
          if (tempUser && tempUser.IsVerified) {
            tempUser.IsVerified = false;
            tempUser
              .save()
              .then(() => {
                console.log(
                  "User verification reverted after 2 minutes:",
                  tempUser.username
                );
              })
              .catch((err) => {
                console.error("Error saving reverted verification:", err);
              });
          }
        })
        .catch((err) => {
          console.error("Error reverting verification:", err);
        });
    }, 2 * 60 * 1000); // 2 minutes

    res.redirect("/premium");
  } catch (error) {
    console.error("Error converting user to premium:", error);
    res
      .status(500)
      .json({ error: "Failed to convert user to premium." });
  }
};

const getForgotPassword =  (req, res) => {
  res.json({ error: null, success: null });
};

const postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "No account found with that email address.", success: null });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");

    // Store token with expiration (1 hour)
    resetTokens.set(resetToken, {
      userId: user._id,
      expires: Date.now() + 3600000, // 1 hour
    });

    // Send reset email
    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
                <h1>Password Reset Request</h1>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ error: null, success: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Error sending reset link. Please try again.", success: null });
  }
};

const getResetPassword = (req, res) => {
  const { token } = req.params;
  const resetToken = crypto.createHash("sha256").update(token).digest("hex");

  const resetData = resetTokens.get(resetToken);

  if (!resetData || resetData.expires < Date.now()) {
    return res.status(400).json({ error: "Invalid or expired reset link. Please request a new one.", success: null });
  }

  res.json({ token, error: null });
};

const postResetPassword = async (req, res) => {
  try {
    const { token, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ token, error: "Passwords do not match." });
    }

    const resetToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetData = resetTokens.get(resetToken);

    if (!resetData || resetData.expires < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired reset link. Please request a new one.", success: null });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await User.findByIdAndUpdate(resetData.userId, {
      password: hashedPassword,
    });

    // Remove used token
    resetTokens.delete(resetToken);

    // Redirect to login with success message
    req.flash(
      "success",
      "Password has been reset. Please login with your new password."
    );
    res.redirect("/login");
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).redirect("/");
  }
};

const getProfile = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    const currentUser = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).send("Profile not found");
    }

    // Fetch posts by this user
    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate("author", "username name profilePhoto IsVerified") // FIX: include IsVerified
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "username name profilePhoto IsVerified",
        }, // FIX: include IsVerified
      })
      .lean();

    // Add a `isLiked` property to each post for the current user
    if (currentUser) {
      posts.forEach((post) => {
        post.isLiked = post.likes.some(
          (like) => like.toString() === currentUser._id.toString()
        );
      });
    }
    // Ensure IsVerified is present in each post's author (for profile page posts)
    posts.forEach((post) => {
      if (post.author && typeof post.author.IsVerified === "undefined") {
        post.author.IsVerified = false;
      }
    });

    // Render profile with posts
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      res.render("partials/profile-main", {
        user,
        currentUser,
        posts,
        layout: false,
      });
    } else {
      res.render("profile", { user, currentUser, posts });
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    res.status(500).send("Error loading profile");
  }
};

// API: Get profile and posts as JSON for React
const getProfileApi = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'username name profilePhoto IsVerified');
    res.json({ user, posts });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

const getFollowing = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).populate({
      path: "following",
      select: "username email followers following",
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const currentUser = await User.findById(req.session.userId);
    if (!currentUser) {
      return res.status(401).send("Unauthorized");
    }

    res.render("following", {
      user,
      currentUser,
      following: user.following,
      layout: false,
    });
  } catch (error) {
    console.error("Following error:", error);
    res.status(500).send("Error loading following list");
  }
};

const getFollowers = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).populate({
      path: "followers",
      select: "username email followers following",
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const currentUser = await User.findById(req.session.userId);
    if (!currentUser) {
      return res.status(401).send("Unauthorized");
    }

    res.render("followers", {
      user,
      currentUser,
      followers: user.followers,
      layout: false,
    });
  } catch (error) {
    console.error("Followers error:", error);
    res.status(500).send("Error loading followers list");
  }
};

const followUser = async (req, res) => {
  try {
    console.log("Follow request received:", req.params);
    const { username } = req.params;
    const currentUserId = req.user ? req.user._id : req.session.userId;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const userToFollow = await User.findOne({ username });
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!currentUser.following.includes(userToFollow._id)) {
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUserId);

      await currentUser.save();
      await userToFollow.save();
    }

    res
      .status(200)
      .json({
        success: true,
        message: "Followed successfully",
        following: true,
      });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ error: "Failed to follow user" });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user ? req.user._id : req.session.userId;

    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const userToUnfollow = await User.findOne({ username });
    const currentUser = await User.findById(currentUserId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );
    userToUnfollow.followers = userToUnfollow.followers.filter(
      (id) => id.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await userToUnfollow.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Unfollowed successfully",
        following: false,
      });
  } catch (error) {
    console.error("Unfollow error:", error);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
};

const editProfilePage =  async (req, res) => {
    try {
      const userId = req.params.id;
      let user = await User.findById(userId);

      if (!user) {
        return res.status(404).render("404", { error: "User not found" });
      }

      // Handle profile and cover image uploads
      let updated = false;
      if (req.files && req.files.Image && req.files.Image[0]) {
        const result = await cloudinary.uploader.upload(
          req.files.Image[0].path,
          { folder: "profile_images" }
        );
        user.profilePhoto.url = result.secure_url;
        fs.unlink(req.files.Image[0].path, () => {});
        updated = true;
      }
      if (req.files && req.files.cover && req.files.cover[0]) {
        const result = await cloudinary.uploader.upload(
          req.files.cover[0].path,
          { folder: "profile_covers" }
        );
        user.profileCover = result.secure_url;
        fs.unlink(req.files.cover[0].path, () => {});
        updated = true;
      }
      if (updated) await user.save();

      // Re-fetch user to get updated data
      user = await User.findById(userId);
      res.render("editeprofile", { user });
    } catch (error) {
      console.error("Error loading edit profile page:", error);
      res
        .status(500)
        .render("error", {
          message: "An error occurred while loading the edit profile page.",
        });
    }
  };

  const updateProfile =  async (req, res) => {
      try {
        const { username, email } = req.body;
        const userId = req.user ? req.user._id : req.session.userId;
        if (!userId) return res.status(400).redirect("/");
        let user = await User.findById(userId);
        if (!user) return res.status(404).redirect("/");
        user.username = username;
        user.email = email;
        // Store profile image and delete previous if not default
        if (req.files && req.files.Image && req.files.Image[0]) {
          // Delete previous profile image from Cloudinary if not default
          if (user.profilePhoto && user.profilePhoto.filename && user.profilePhoto.filename !== "profile_images") {
            try {
              await cloudinary.uploader.destroy(user.profilePhoto.filename);
            } catch (err) {
              console.error("Error deleting previous profile photo from Cloudinary:", err);
            }
          }
          const result = await cloudinary.uploader.upload(
            req.files.Image[0].path,
            { folder: "profile_images" }
          );
          user.profilePhoto = {
            url: result.secure_url,
            filename: result.public_id,
          };
          fs.unlink(req.files.Image[0].path, () => {});
        }
        // Store cover image and delete previous if not default
        if (req.files && req.files.cover && req.files.cover[0]) {
          if (user.coverPhoto && user.coverPhoto.filename && user.coverPhoto.filename !== "profile_covers") {
            try {
              await cloudinary.uploader.destroy(user.coverPhoto.filename);
            } catch (err) {
              console.error("Error deleting previous cover photo from Cloudinary:", err);
            }
          }
          const result = await cloudinary.uploader.upload(
            req.files.cover[0].path,
            { folder: "profile_covers" }
          );
          user.coverPhoto = {
            url: result.secure_url,
            filename: result.public_id,
          };
          fs.unlink(req.files.cover[0].path, () => {});
        }
        await user.save();
        // If request is AJAX/JSON (React), return updated user as JSON
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
          user = await User.findById(userId); // re-fetch for latest
          return res.json({ success: true, user });
        } else {
          res.redirect("/");
        }
      } catch (error) {
        console.error("Profile update error:", error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
          res.status(500).json({ success: false, error: "Profile update failed" });
        } else {
          res.status(500).redirect("/");
        }
      }
    };


    const getBookmarks = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const user = await User.findById(userId).populate({
      path: "bookmarks",
      populate: {
        path: "author",
        select: "username name profilePhoto IsVerified",
      },
    });
    if (!user) return res.redirect("/login");
    const posts = user.bookmarks || [];
    res.render("bookmarks", { user, posts });
  } catch (error) {
    console.error("Error loading bookmarks:", error);
    res.status(500).render("error", { error: "Failed to load bookmarks." });
  }
};

// API: Get bookmarks as JSON for React
const getBookmarksApi = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const user = await User.findById(userId).populate({
      path: "bookmarks",
      populate: {
        path: "author",
        select: "username name profilePhoto IsVerified",
      },
    });
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    const posts = user.bookmarks || [];
    res.json({ posts });
  } catch (error) {
    console.error("Error loading bookmarks (API):", error);
    res.status(500).json({ error: "Failed to load bookmarks." });
  }
};

const getSettings = async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user ? req.user._id : req.session.userId;

    // Verify that the user is accessing their own settings
    if (userId !== currentUserId.toString()) {
      return res.redirect("/");
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.redirect("/");
    }

    res.render("settings", { user });
  } catch (error) {
    console.error("Settings error:", error);
    res.redirect("/");
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete all posts by user (and their images/comments)
    const userPosts = await Post.find({ author: userId });
    for (const post of userPosts) {
      // Remove all embedded replies (subdocuments) authored by the user from this post
      if (post.replies && post.replies.length > 0) {
        post.replies = post.replies.filter(reply => String(reply.author) !== String(userId));
        await post.save();
      }
      // Delete post image from Cloudinary if present
      if (post.image && post.image.url && post.image.filename) {
        try {
          await cloudinary.uploader.destroy(post.image.filename);
        } catch (imgErr) {
          console.error("Error deleting post image:", imgErr);
        }
      }
      await Post.findByIdAndDelete(post._id);
    }


    // Delete all embedded comments/replies authored by the user from all posts (not just others)
    const postsWithUserReplies = await Post.find({ replies: { $exists: true, $ne: [] } });
    for (const post of postsWithUserReplies) {
      if (post.replies && post.replies.length > 0) {
        const originalLength = post.replies.length;
        post.replies = post.replies.filter(reply => String(reply.author) !== String(userId));
        if (post.replies.length !== originalLength) {
          await post.save();
        }
      }
    }

    // Remove user's likes from all posts
    await Post.updateMany(
      { likes: userId },
      { $pull: { likes: userId } },
      { multi: true }
    );

    // Remove user's bookmarks from all users
    await User.updateMany(
      { bookmarks: userPosts.map(p => p._id) },
      { $pull: { bookmarks: { $in: userPosts.map(p => p._id) } } },
      { multi: true }
    );

    // Remove user from followers/following of others
    await User.updateMany(
      { followers: userId },
      { $pull: { followers: userId } },
      { multi: true }
    );
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } },
      { multi: true }
    );

    // Delete profile photo from Cloudinary if not default
    if (
      user &&
      user.profilePhoto &&
      user.profilePhoto.filename &&
      user.profilePhoto.filename !== "profile_images"
    ) {
      try {
        await cloudinary.uploader.destroy(user.profilePhoto.filename);
      } catch (err) {
        console.error("Error deleting profile photo from Cloudinary:", err);
      }
    }
    // Delete cover photo from Cloudinary if not default
    if (
      user &&
      user.coverPhoto &&
      user.coverPhoto.filename &&
      user.coverPhoto.filename !== "profile_covers"
    ) {
      try {
        await cloudinary.uploader.destroy(user.coverPhoto.filename);
      } catch (err) {
        console.error("Error deleting cover photo from Cloudinary:", err);
      }
    }

    // Delete user account
    await User.findByIdAndDelete(userId);
    // Logout and destroy session
    if (typeof req.logout === 'function') {
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
        }
        req.session.destroy((err) => {
          if (err) {
            console.error("Session destruction error:", err);
          }
          res.redirect("/login");
        });
      });
    } else {
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
        res.redirect("/login");
      });
    }
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
};


const directProfile = async (req, res) => {
  try {
    const username = req.params.username;
    // Skip if the route is a known route
    if (
      [
        "home",
        "users",
        "bookmarks",
        "login",
        "register",
        "logout",
        "profile",
        "forgot-password",
        "reset-password",
        "search",
        "post",
        "posts",
        "new",
        "edit"
      ].includes(username)
    ) {
      return res.status(404).render("error", { error: "Page not found" });
    }
    const user = await User.findOne({ username });

    if (!user) {
      return res.redirect("/");
    }

    // Empty posts array for UI
    const posts = [];

    res.render("profile", {
      user,
      currentUser,
      posts,
      error: null,
      success: null,
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.redirect("/");
  }
};

// API: Get followers as JSON for React
const getFollowersApi = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).populate({
      path: "followers",
      select: "_id username email profilePhoto IsVerified",
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { _id: user._id, username: user.username }, followers: user.followers });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// API: Get following as JSON for React
const getFollowingApi = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }).populate({
      path: "following",
      select: "_id username email profilePhoto IsVerified",
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { _id: user._id, username: user.username }, following: user.following });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all messages (sent or received) for the current user
const getAllMessagesForCurrentUser = async (req, res) => {
  try {
   
    let userId = req.user ? req.user._id : req.session.userId;
   
    if (!userId) {
      console.error('Not authenticated: req.user and req.session.userId are missing', 'req.user:', req.user, 'req.session:', req.session);
      return res.status(401).json({ error: 'Not authenticated' });
    }
    // Defensive: check Message model exists
    if (!Message || typeof Message.find !== 'function') {
      console.error('Message model is not defined or not connected', Message);
      return res.status(500).json({ error: 'Message model error' });
    }
    // Fix: Always get string value for userId (ObjectId or string)
    if (typeof userId === 'object' && userId.toHexString) {
      userId = userId.toHexString();
    } else if (typeof userId !== 'string') {
      userId = String(userId);
    }
    // Validate userId is a valid ObjectId string
    if (!userId || typeof userId !== 'string' || userId.length !== 24) {
      console.error('Invalid userId format for ObjectId:', userId, 'typeof:', typeof userId);
      // But do not return error, just return empty messages for safety
      return res.json({ messages: [] });
    }
    let messages = [];
    try {
      // Ensure userId is a valid ObjectId for querying
      const mongoose = require('mongoose');
      const validUserId = mongoose.Types.ObjectId.isValid(userId) ? mongoose.Types.ObjectId(userId) : userId;
      messages = await Message.find({
        $or: [
          { sender: validUserId },
          { receiver: validUserId }
        ]
      }).sort({ createdAt: 1 });
    } catch (err) {
      console.error('Mongoose Message.find error:', err);
      // Return empty array instead of 500 to avoid frontend crash
      return res.json({ messages: [] });
    }
    res.json({ messages });
  } catch (err) {
    console.error('getAllMessagesForCurrentUser error:', err);
    if (err && err.stack) console.error('STACK:', err.stack);
    // Always return empty messages array on any error, never a 500
    return res.json({ messages: [] });
  }
};

// Block a user
const blockUser = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : req.session.userId;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID required.' });
    if (userId === String(currentUserId)) return res.status(400).json({ message: 'You cannot block yourself.' });
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);
    if (!currentUser || !targetUser) return res.status(404).json({ message: 'User not found.' });
    // Add to blockedUsers if not already
    if (!currentUser.blockedUsers.map(id => String(id)).includes(String(userId))) {
      currentUser.blockedUsers.push(userId);
    }
    // Add to blockedBy for the target user
    if (!targetUser.blockedBy.map(id => String(id)).includes(String(currentUserId))) {
      targetUser.blockedBy.push(currentUserId);
    }
    await currentUser.save();
    await targetUser.save();
    // Return updated block lists for both users, and both user objects for real-time update
    const updatedCurrentUser = await User.findById(currentUserId).select('_id username email profilePhoto IsVerified blockedUsers blockedBy');
    const updatedTargetUser = await User.findById(userId).select('_id username email profilePhoto IsVerified blockedUsers blockedBy');
    res.json({ 
      message: 'User blocked successfully.',
      blockedUsers: updatedCurrentUser.blockedUsers,
      blockedBy: updatedTargetUser.blockedBy,
      currentUser: updatedCurrentUser,
      targetUser: updatedTargetUser,
      currentUserId,
      userId
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to block user.' });
  }
};

// Unblock a user
const unblockUser = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : req.session.userId;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'User ID required.' });
    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);
    if (!currentUser || !targetUser) return res.status(404).json({ message: 'User not found.' });
    // Remove from blockedUsers only if present
    if (currentUser.blockedUsers.map(id => String(id)).includes(String(userId))) {
      currentUser.blockedUsers = currentUser.blockedUsers.filter(id => String(id) !== String(userId));
    }
    // Remove from blockedBy for the target user only if present
    if (targetUser.blockedBy.map(id => String(id)).includes(String(currentUserId))) {
      targetUser.blockedBy = targetUser.blockedBy.filter(id => String(id) !== String(currentUserId));
    }
    await currentUser.save();
    await targetUser.save();
    // Return updated block lists for both users, and both user objects for real-time update
    const updatedCurrentUser = await User.findById(currentUserId).select('_id username email profilePhoto IsVerified blockedUsers blockedBy');
    const updatedTargetUser = await User.findById(userId).select('_id username email profilePhoto IsVerified blockedUsers blockedBy');
    res.json({ 
      message: 'User unblocked successfully.',
      blockedUsers: updatedCurrentUser.blockedUsers,
      blockedBy: updatedTargetUser.blockedBy,
      currentUser: updatedCurrentUser,
      targetUser: updatedTargetUser,
      currentUserId,
      userId
    });
  } catch (err) {
    console.error('Unblock user error:', err);
    res.status(500).json({ message: 'Failed to unblock user.' });
  }
};

module.exports = {
  getLogin,
  postLogin,
  logout,
  getRegister,
  postRegister,
  getPremium,
  postPremium,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
  getProfile,
  getProfileApi,
  getFollowing,
  getFollowers,
  followUser,
  unfollowUser,
  editProfilePage,
  updateProfile,
  getBookmarks,
  getBookmarksApi,
  getSettings,
  deleteAccount,
  directProfile,
  getFollowersApi,
  getFollowingApi,
  searchUsersAndPosts,
  getAllUsersApi,
  sendMessage,
  getMessages,
  getAllMessagesForCurrentUser,
  getCurrentUserApi,
  blockUser,
  unblockUser
};
