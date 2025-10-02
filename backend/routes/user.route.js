console.log('user.route.js loaded: registering /api/messages/all route');


require('dotenv').config();
const express = require('express');
const {Router} = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
// Passport removed - using session-based authentication only
// Google OAuth removed - using session-based authentication only
const { cloudinary, poststorage, profileImageStorage, profileCoverStorage, getProfileStorage } = require('../cloudconflic.js');
const multer = require('multer');
const os = require('os');
const fs = require('fs');
const uploadPost = multer({ storage: poststorage });
const uploadProfileImage = multer({ storage: profileImageStorage });
const uploadProfileCover = multer({ storage: profileCoverStorage });
const methodOverride = require('method-override');
// User Schema
const User = require('../models/User.js');




const {
  getLogin,
  postLogin,
  getRegister,
  postRegister,
  logout,
  getPremium,
  postPremium,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
  getProfile,
  getFollowing,
  getFollowers,
  followUser,
  unfollowUser,
  editProfilePage,
  updateProfile,
  getBookmarks,
  getSettings,
  deleteAccount,
  directProfile,
  getProfileApi,
  getBookmarksApi,
  getFollowersApi,
  getFollowingApi,
  searchUsersAndPosts,
  getAllUsersApi,
  sendMessage,
  getMessages,
  getCurrentUserApi,
  blockUser,
  unblockUser
} = require("../controller/user.controller.js");



const messageController = require('../controller/message.controller');
const router = Router();


// Always use the local isAuthenticated middleware to avoid circular dependency
const isAuthenticated = require('../middleware/auth').isAuthenticated;

// Mark messages as read and get message counts
const { markMessagesRead, getMessageCounts, getUnreadCountsPerUser } = require('../controller/markRead.controller');
// API: Get unread message counts per user
router.get('/api/messages/unread-counts', isAuthenticated, getUnreadCountsPerUser);
// API: Mark messages as read
router.post('/api/messages/mark-read', isAuthenticated, markMessagesRead);
// API: Get read/unread message counts
router.get('/api/messages/counts', isAuthenticated, getMessageCounts);

// Auth routes
router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/logout', logout);

// Premium
router.get('/premium', isAuthenticated, getPremium);
router.post('/premium', isAuthenticated, postPremium);

// Forgot/reset password
router.get('/forgot-password', getForgotPassword);
router.post('/forgot-password', postForgotPassword);
router.get('/reset-password/:token', getResetPassword);
router.post('/reset-password', postResetPassword);

// Profile
router.get('/profile/:username', isAuthenticated, getProfile);
router.get('/profile/:username/following', isAuthenticated, getFollowing);
router.get('/profile/:username/followers', isAuthenticated, getFollowers);
router.post('/profile/:username/follow', isAuthenticated, followUser);
router.post('/profile/:username/unfollow', isAuthenticated, unfollowUser);
router.get('/profile/:id/edit', isAuthenticated, uploadProfileImage.single('Image'), editProfilePage);
// Configure multer for profile uploads with temporary storage
const uploadProfile = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, os.tmpdir());
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Profile update route with correct field names
router.post('/profile/edit', isAuthenticated, uploadProfile.fields([
  { name: 'profilePhoto', maxCount: 1 }, 
  { name: 'coverPhoto', maxCount: 1 }
]), updateProfile);
// API route for React profile fetch
router.get('/api/profile/:username', getProfileApi);
// API endpoints for followers/following (React)
router.get('/api/profile/:username/followers', getFollowersApi);
router.get('/api/profile/:username/following', getFollowingApi);

// API: Get current user (for React chat)
router.get('/api/users/me', isAuthenticated, getCurrentUserApi);
// API: Search users and posts (for React search page)
router.get('/api/search', searchUsersAndPosts);
// API: Get all users (for React)
router.get('/api/users', getAllUsersApi);


// Chat message APIs
router.post('/api/messages', isAuthenticated, sendMessage);
router.get('/api/messages/:userId', isAuthenticated, getMessages);
// Share post link via message
router.post('/api/message/share', isAuthenticated, messageController.shareMessage);
// Delete message for current user only ("Delete for you")
router.post('/api/messages/delete-for-me', isAuthenticated, messageController.deleteMessageForMe);
// Edit message (sender only)
router.post('/api/messages/edit', isAuthenticated, messageController.editMessage);
// Delete message for everyone (permanently)
const deleteMessageController = require('../controller/deleteMessage.controller');
router.post('/api/messages/delete-for-everyone', isAuthenticated, deleteMessageController.deleteMessageForEveryone);

// Empty chat for current user only ("Empty chat for you")
const emptyChatController = require('../controller/emptyChat.controller');
router.post('/api/messages/empty-chat-for-me', isAuthenticated, emptyChatController.emptyChatForMe);
// API: Get all messages for current user (inbox + sent)
const { getAllMessagesForCurrentUser } = require("../controller/user.controller.js");
router.get('/api/messages/all', isAuthenticated, getAllMessagesForCurrentUser);

router.post('/api/profile/:username/toggle-follow', isAuthenticated, async (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user ? req.user._id : req.session.userId;
  if (!username) return res.status(400).json({ error: 'Username is required' });
  const userToToggle = await User.findOne({ username });
  if (!userToToggle) return res.status(404).json({ error: 'User not found' });
  const isFollowing = await User.exists({ _id: currentUserId, following: userToToggle._id });
  try {
    if (isFollowing) {
      // Unfollow atomically
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: userToToggle._id } });
      await User.findByIdAndUpdate(userToToggle._id, { $pull: { followers: currentUserId } });
    } else {
      // Follow atomically
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: userToToggle._id } });
      await User.findByIdAndUpdate(userToToggle._id, { $addToSet: { followers: currentUserId } });
      // Create notification for followed user
      const notificationController = require('../controller/notification.controller');
      await notificationController.createNotification({
        user: userToToggle._id,
        type: 'follow',
        fromUser: currentUserId,
        message: 'started following you',
      });
    }
    res.status(200).json({ success: true, following: !isFollowing });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update follow status' });
  }
});

// Block and Unblock user API endpoints
router.post('/api/users/block', isAuthenticated, blockUser);
router.post('/api/users/unblock', isAuthenticated, unblockUser);

// Bookmarks
router.get('/bookmarks', isAuthenticated, getBookmarks);
// API route for bookmarks (JSON)
router.get('/api/bookmarks', isAuthenticated, getBookmarksApi);

// Settings
router.get('/:id/settings', isAuthenticated, getSettings);

// Delete account
router.post('/delete-account', isAuthenticated, deleteAccount);

// Direct username route
router.get('/:username', isAuthenticated, directProfile);

//

module.exports = router;
