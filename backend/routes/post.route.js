// COMPLETELY FIXED post.route.js - Fixed middleware import issue
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
const { cloudinary, poststorage, getProfileStorage } = require('../cloudconflic');
const multer = require('multer');
const os = require('os');
const fs = require('fs');
const methodOverride = require('method-override');
const Post = require('../models/Post.js');

// Import all controller functions
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

// FIXED: Import the correct middleware name
const protect = require('../middleware/auth'); // This exports 'protect', not 'isAuthenticated'

// Debug: Log imported functions and middleware to verify they exist
console.log('Post controller functions:', {
  getSinglePost: typeof getSinglePost,
  getNewPost: typeof getNewPost,
  createPost: typeof createPost,
  getComments: typeof getComments,
  addReply: typeof addReply,
  protect: typeof protect // Check middleware too
});

// ✅ Ensure all imported controller functions exist
if (!getNewPost || !createPost || !getEditPost || !updatePost || !deletePost || 
    !likePost || !bookmarkPost || !getSinglePost || !addReply || !getComments || 
    !likeComment || !editComment || !deleteComment) {
  console.error('Missing controller functions:', {
    getNewPost: !!getNewPost,
    createPost: !!createPost,
    getEditPost: !!getEditPost,
    updatePost: !!updatePost,
    deletePost: !!deletePost,
    likePost: !!likePost,
    bookmarkPost: !!bookmarkPost,
    getSinglePost: !!getSinglePost,
    addReply: !!addReply,
    getComments: !!getComments,
    likeComment: !!likeComment,
    editComment: !!editComment,
    deleteComment: !!deleteComment
  });
  throw new Error('One or more post controller functions are undefined! Check post.controller.js exports.');
}

// ✅ Ensure middleware exists
if (!protect) {
  throw new Error('Auth middleware (protect) is undefined! Check middleware/auth.js exports.');
}

const router = Router();
const uploadPost = multer({ storage: poststorage });

// ================= Routes =================

// New post routes
router.get('/post/new', protect, getNewPost);
router.post('/api/post/new', protect, uploadPost.single('image'), createPost);

// Edit post routes
router.get('/post/:id/edit', protect, getEditPost);
router.put('/api/post/:id/edit', protect, uploadPost.single('image'), updatePost);

// Delete post routes
router.delete('/api/post/:id/delete', protect, deletePost);
router.post('/post/:id/delete', protect, deletePost); // compatibility

// Like/Unlike post
router.post('/post/:id/like', protect, likePost);

// Bookmark post
router.post('/post/:id/bookmark', protect, bookmarkPost);

// View single post (public - no auth needed)
router.get('/post/:id', getSinglePost);

// Comments & replies routes
router.post('/post/:postId/reply', protect, addReply);
router.get('/post/:postId/comments', getComments); // Public - no auth needed
router.post('/post/:postId/comments/:commentId/like', protect, likeComment);
router.put('/post/:postId/comments/:commentId/edit', protect, editComment);
router.delete('/post/:postId/comments/:commentId/delete', protect, deleteComment);

// Plural alias routes for frontend compatibility
router.post('/posts/:postId/reply', protect, addReply);
router.get('/posts/:postId/comments', getComments); // Public - no auth needed
router.post('/posts/:postId/comments/:commentId/like', protect, likeComment);
router.put('/posts/:postId/comments/:commentId/edit', protect, editComment);
router.delete('/posts/:postId/comments/:commentId/delete', protect, deleteComment);

// API: Get single post as JSON (public)
router.get('/api/post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username name profilePhoto IsVerified')
      .lean();
      
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({ post });
  } catch (err) {
    console.error('Error fetching single post:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// API: Get all posts (public with optional pagination)
router.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const posts = await Post.find()
      .populate('author', 'username name profilePhoto IsVerified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
      
    const totalPosts = await Post.countDocuments();
    res.json({ 
      posts, 
      currentPage: parseInt(page), 
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts 
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
