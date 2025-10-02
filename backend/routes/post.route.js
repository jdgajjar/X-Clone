require('dotenv').config();
const { Router } = require('express');
const multer = require('multer');
const Post = require('../models/Post.js');
const { postStorage } = require('../cloudconflic'); // Updated import name
const { isAuthenticated } = require('../middleware/auth');

// Import controllers
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

// Configure multer for post images
const uploadPost = multer({ 
  storage: postStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes
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
  router.post('/post/:id/delete', isAuthenticated, deletePost);
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
  router.post('/posts/:postId/reply', isAuthenticated, addReply);
}

if (typeof getComments === 'function') {
  router.get('/post/:postId/comments', getComments);
  router.get('/posts/:postId/comments', getComments);
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

// API routes for fetching posts
router.get('/api/post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username profilePhoto IsVerified').lean();
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/api/posts', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'username profilePhoto IsVerified')
      .lean();
    
    res.json({ 
      posts, 
      currentPage: parseInt(page), 
      totalPages: Math.ceil(await Post.countDocuments() / limit) 
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
