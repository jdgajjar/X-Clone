require('dotenv').config();
const express = require('express');
const router = express.Router(); // <-- declare router FIRST
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const os = require('os');
const fs = require('fs');
const methodOverride = require('method-override');

const { cloudinary, poststorage, getProfileStorage } = require('../cloudconflic');
const { isAuthenticated } = require('../middleware/auth');
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
} = require('../controller/post.controller.js'); // path must match exactly

const uploadPost = multer({ storage: poststorage });

// Debug: check imported functions
console.log('Post controller functions:', {
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
});


if (typeof getNewPost === 'function') {
  router.get('/post/new', isAuthenticated, getNewPost);
}

if (typeof createPost === 'function') {
  router.post('/api/post/new', isAuthenticated, uploadPost.single('image'), createPost);
}

if (typeof getEditPost === 'function') {
  router.get('/post/:id/edit', isAuthenticated, getEditPost);
}

if (typeof updatePost === 'function') {
  router.put('/api/post/:id/edit', isAuthenticated, uploadPost.single('image'), updatePost);
}

if (typeof deletePost === 'function') {
  router.delete('/api/post/:id/delete', isAuthenticated, deletePost);
  router.post('/post/:id/delete', isAuthenticated, deletePost); // compatibility
}

if (typeof likePost === 'function') {
  router.post('/post/:id/like', isAuthenticated, likePost);
}

if (typeof bookmarkPost === 'function') {
  router.post('/post/:id/bookmark', isAuthenticated, bookmarkPost);
}

if (typeof getSinglePost === 'function') {
  router.get('/post/:id', getSinglePost);
}

if (typeof addReply === 'function') {
  router.post('/post/:postId/reply', isAuthenticated, addReply);
  router.post('/posts/:postId/reply', isAuthenticated, addReply); // plural alias
}

if (typeof getComments === 'function') {
  router.get('/post/:postId/comments', getComments);
  router.get('/posts/:postId/comments', getComments); // plural alias
}

if (typeof likeComment === 'function') {
  router.post('/post/:postId/comments/:commentId/like', isAuthenticated, likeComment);
  router.post('/posts/:postId/comments/:commentId/like', isAuthenticated, likeComment);
}

if (typeof editComment === 'function') {
  router.put('/post/:postId/comments/:commentId/edit', isAuthenticated, editComment);
  router.put('/posts/:postId/comments/:commentId/edit', isAuthenticated, editComment);
}

if (typeof deleteComment === 'function') {
  router.delete('/post/:postId/comments/:commentId/delete', isAuthenticated, deleteComment);
  router.delete('/posts/:postId/comments/:commentId/delete', isAuthenticated, deleteComment);
}



// ✅ Ensure all imported controller functions exist
if (!getNewPost || !createPost || !getEditPost || !updatePost || !deletePost || !likePost || !bookmarkPost || !getSinglePost || !addReply || !getComments || !likeComment || !editComment || !deleteComment) {
  throw new Error('One or more post controller functions are undefined! Check post.controller.js exports.');
}



// ================= Routes =================

// New post
router.get('/post/new', isAuthenticated, getNewPost);
router.post('/api/post/new', isAuthenticated, uploadPost.single('image'), createPost);

// Edit post
router.get('/post/:id/edit', isAuthenticated, getEditPost);
router.put('/api/post/:id/edit', isAuthenticated, uploadPost.single('image'), updatePost);

// Delete post
router.delete('/api/post/:id/delete', isAuthenticated, deletePost);
router.post('/post/:id/delete', isAuthenticated, deletePost); // compatibility

// Like/Unlike post
router.post('/post/:id/like', isAuthenticated, likePost);

// Bookmark post
router.post('/post/:id/bookmark', isAuthenticated, bookmarkPost);

// View single post
router.get('/post/:id', getSinglePost);

// Comments & replies
router.post('/post/:postId/reply', isAuthenticated, addReply);
router.get('/post/:postId/comments', getComments);
router.post('/post/:postId/comments/:commentId/like', isAuthenticated, likeComment);
router.put('/post/:postId/comments/:commentId/edit', isAuthenticated, editComment);
router.delete('/post/:postId/comments/:commentId/delete', isAuthenticated, deleteComment);

// Plural alias routes for frontend
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
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
