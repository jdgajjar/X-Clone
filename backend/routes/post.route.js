require('dotenv').config();
const { Router } = require('express');
const multer = require('multer');
const Post = require('../models/Post.js');
const { poststorage } = require('../cloudconflic');
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
// Enhanced multer configuration for post uploads with improved error handling
const uploadPost = multer({
  storage: poststorage,
  fileFilter: (req, file, cb) => {
    console.log('📁 Post upload - File filter check:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (file.mimetype && allowedTypes.includes(file.mimetype)) {
      console.log('✅ Post file type accepted:', file.mimetype);
      cb(null, true);
    } else {
      console.error('❌ Post file type rejected:', file.mimetype);
      const error = new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, and WebP images are allowed.`);
      error.code = 'INVALID_FILE_TYPE';
      cb(error, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // Max 1 file per post
    fieldSize: 10 * 1024 * 1024, // 10MB field size limit
    fieldNameSize: 100, // fieldname size limit
    fields: 10 // Max number of non-file fields
  },
  onError: (err, next) => {
    console.error('❌ Multer error in post upload:', err);
    next(err);
  }
});

// ================= Routes =================
// Only attach routes if controller exists
if (typeof getNewPost === 'function') {
  router.get('/post/new', isAuthenticated, getNewPost);
}

if (typeof createPost === 'function') {
  router.post('/api/post/new', isAuthenticated, (req, res, next) => {
    console.log('📝 POST /api/post/new - Before multer:', {
      contentType: req.headers['content-type'],
      hasBody: !!req.body,
      bodyType: typeof req.body,
      bodyKeys: Object.keys(req.body || {}),
      hasFile: !!req.file,
      hasFiles: !!req.files
    });
    
    uploadPost.single('image')(req, res, (err) => {
      if (err) {
        console.error('❌ Multer error in createPost:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false, 
            error: 'File size too large. Maximum size is 5MB.' 
          });
        } else if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({ 
            success: false, 
            error: err.message 
          });
        } else {
          return res.status(400).json({ 
            success: false, 
            error: 'File upload failed: ' + (err.message || 'Unknown error') 
          });
        }
      }
      
      console.log('✅ Multer processing complete:', {
        hasFile: !!req.file,
        hasFiles: !!req.files,
        body: req.body,
        fileInfo: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        } : null
      });
      
      next();
    });
  }, createPost);
}

if (typeof getEditPost === 'function') {
  router.get('/post/:id/edit', isAuthenticated, getEditPost);
}

if (typeof updatePost === 'function') {
  router.put('/api/post/:id/edit', isAuthenticated, (req, res, next) => {
    console.log('🔄 PUT /api/post/:id/edit - Before multer:', {
      contentType: req.headers['content-type'],
      hasBody: !!req.body,
      bodyType: typeof req.body,
      bodyKeys: Object.keys(req.body || {}),
      hasFile: !!req.file,
      hasFiles: !!req.files
    });
    
    uploadPost.single('image')(req, res, (err) => {
      if (err) {
        console.error('❌ Multer error in updatePost:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false, 
            error: 'File size too large. Maximum size is 5MB.' 
          });
        } else if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({ 
            success: false, 
            error: err.message 
          });
        } else {
          return res.status(400).json({ 
            success: false, 
            error: 'File upload failed: ' + (err.message || 'Unknown error') 
          });
        }
      }
      
      console.log('✅ Multer processing complete for update:', {
        hasFile: !!req.file,
        hasFiles: !!req.files,
        body: req.body,
        fileInfo: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype
        } : null
      });
      
      next();
    });
  }, updatePost);
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
  router.post('/posts/:postId/reply', isAuthenticated, addReply); // alias
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

// Optional API routes for fetching posts
router.get('/api/post/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
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
      .lean();
    res.json({ posts, currentPage: page, totalPages: Math.ceil(await Post.countDocuments() / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
