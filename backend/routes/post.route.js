require('dotenv').config();
const express = require('express');
const { Router } = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { cloudinary, poststorage, getProfileStorage } = require('../cloudconflic');
const multer = require('multer');
const os = require('os');
const fs = require('fs');
const uploadPost = multer({ storage: poststorage });
const methodOverride = require('method-override');

// Import Post model
const Post = require('../models/Post.js');

const {
  getNewPost,
  createPost,
  getEditPost,
  updatePost,
  deletePost,
  likePost,
  bookmarkPost,
  getSinglePost,
  addReply,
  getComments,
  likeComment,
  editComment,
  deleteComment
} = require('../controller/post.controller.js');

const router = Router();
const { isAuthenticated } = require('../middleware/auth');



//New post
router.get('/post/new', isAuthenticated, getNewPost);
router.post('/api/post/new', isAuthenticated, uploadPost.single('image'), createPost);

// Edit post
router.get('/post/:id/edit', isAuthenticated, getEditPost);
router.put('/api/post/:id/edit', isAuthenticated, uploadPost.single('image'), updatePost);



// Delete post
router.delete('/api/post/:id/delete', isAuthenticated, deletePost);

// Like/Unlike post
router.post('/post/:id/like', isAuthenticated, likePost);

// Bookmark post
router.post('/post/:id/bookmark', isAuthenticated, bookmarkPost);

// View single post
router.get('/post/:id', getSinglePost);

// Add a reply to a post
router.post('/post/:postId/reply', isAuthenticated, addReply);
// Fetch comments for a post
router.get('/post/:postId/comments', getComments);
// Like/unlike a comment
router.post('/post/:postId/comments/:commentId/like', isAuthenticated, likeComment);
// Edit a comment
router.put('/post/:postId/comments/:commentId/edit', isAuthenticated, editComment);
// Delete a comment
router.delete('/post/:postId/comments/:commentId/delete', isAuthenticated, deleteComment);

// Also support POST for delete for compatibility
router.post('/post/:id/delete', isAuthenticated, deletePost);

// Plural alias routes for frontend compatibility
router.post('/posts/:postId/reply', isAuthenticated, addReply);
router.get('/posts/:postId/comments', getComments);
router.post('/posts/:postId/comments/:commentId/like', isAuthenticated, likeComment);
router.put('/posts/:postId/comments/:commentId/edit', isAuthenticated, editComment);
router.delete('/posts/:postId/comments/:commentId/delete', isAuthenticated, deleteComment);

// API: Get single post as JSON for React
router.get('/api/post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username name profilePhoto IsVerified')
      .lean();
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
