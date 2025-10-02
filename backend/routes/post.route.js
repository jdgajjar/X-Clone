// FIXED post.route.js - Clean and optimized routing file
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

// Debug: Log imported functions to verify they exist
console.log('Post controller functions:', {
  getSinglePost: typeof getSinglePost,
  getNewPost: typeof getNewPost,
  createPost: typeof createPost,
  getComments: typeof getComments,
  addReply: typeof addReply
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

const router = Router();
const { isAuthenticated } = require('../middleware/auth');
const uploadPost = multer({ storage: poststorage });

// ================= Routes =================

// New post routes
router.get('/post/new', isAuthenticated, getNewPost);
router.post('/api/post/new', isAuthenticated, uploadPost.single('image'), createPost);

// Edit post routes
router.get('/post/:id/edit', isAuthenticated, getEditPost);
router.put('/api/post/:id/edit', isAuthenticated, uploadPost.single('image'), updatePost);

// Delete post routes
router.delete('/api/post/:id/delete', isAuthenticated, deletePost);
router.post('/post/:id/delete', isAuthenticated, deletePost); // compatibility

// Like/Unlike post
router.post('/post/:id/like', isAuthenticated, likePost);

// Bookmark post
router.post('/post/:id/bookmark', isAuthenticated, bookmarkPost);

// View single post
router.get('/post/:id', getSinglePost);

// Comments & replies routes
router.post('/post/:postId/reply', isAuthenticated, addReply);
router.get('/post/:postId/comments', getComments);
router.post('/post/:postId/comments/:commentId/like', isAuthenticated, likeComment);
router.put('/post/:postId/comments/:commentId/edit', isAuthenticated, editComment);
router.delete('/post/:postId/comments/:commentId/delete', isAuthenticated, deleteComment);

// Plural alias routes for frontend compatibility
router.post('/posts/:postId/reply', isAuthenticated, addReply);
router.get('/posts/:postId/comments', getComments);
router.post('/posts/:postId/comments/:commentId/like', isAuthenticated, likeComment);
router.put('/posts/:postId/comments/:commentId/edit', isAuthenticated, editComment);
router.delete('/posts/:postId/comments/:commentId/delete', isAuthenticated, deleteComment);

// API: Get single post as JSON
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

// API: Get all posts (if needed)
router.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const posts = await Post.find()
      .populate('author', 'username name profilePhoto IsVerified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
      
    res.json({ posts, currentPage: page, totalPages: Math.ceil(await Post.countDocuments() / limit) });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
