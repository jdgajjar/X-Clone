// FIXED post.controller.js - Remove the duplicate getComments export
// Import Post model
const Post = require("../models/Post.js");

// Utility: Remove all replies with author missing or username 'Unknown' from all posts
async function deleteUnknownCommentsFromAllPosts() {
  const posts = await Post.find({ 'replies': { $exists: true, $ne: [] } }).populate('replies.author');
  let totalDeleted = 0;
  for (const post of posts) {
    let changed = false;
    post.replies = post.replies.filter(reply => {
      if (!reply.author || reply.author.username === 'Unknown') {
        totalDeleted++;
        changed = true;
        return false;
      }
      return true;
    });
    if (changed) {
      await post.save();
    }
  }
  if (totalDeleted > 0) {
    console.log(`Auto-cleaned ${totalDeleted} comments with username 'Unknown' or missing author.`);
  }
}

// FIXED: Rename filteredGetComments to getComments and remove duplicate export
async function getComments(req, res) {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate({
      path: 'replies.author',
      select: 'username profilePhoto profileImage IsVerified',
    });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Remove from DB: filter out and save if needed
    const filteredReplies = post.replies.filter(reply => reply.author && reply.author.username !== 'Unknown');
    if (filteredReplies.length !== post.replies.length) {
      post.replies = filteredReplies;
      await post.save();
    }

    const repliesWithImages = filteredReplies.map(reply => {
      if (reply.author) {
        if (!reply.author.profileImage && reply.author.profilePhoto) {
          reply.author.profileImage = reply.author.profilePhoto;
        }
        if (!reply.author.profilePhoto && reply.author.profileImage) {
          reply.author.profilePhoto = reply.author.profileImage;
        }
        if (typeof reply.author.IsVerified === 'undefined') {
          reply.author.IsVerified = false;
        }
      }
      return reply;
    });

    res.status(200).json(repliesWithImages);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'An error occurred while fetching comments.' });
  }
}

// REMOVED: module.exports.getComments = filteredGetComments; // This line was causing the conflict

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const {
  cloudinary,
  poststorage,
  profileImageStorage,
  profileCoverStorage,
  getProfileStorage,
} = require("../cloudconflic.js");
const multer = require("multer");
const os = require("os");
const fs = require("fs");

const uploadPost = multer({ storage: poststorage });
const uploadProfile = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, os.tmpdir()); // Use OS temp directory
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => cb(null, true),
});

const methodOverride = require("method-override");

// User Schema
const User = require("../models/User.js");

const getNewPost = (req, res) => {
  res.json({ user: req.user });
};

const createPost = async (req, res) => {
  try {
    let { content } = req.body;
    let userId = req.user ? req.user._id : req.session.userId;

    // Debug logging
    console.log('CREATE POST DEBUG:', {
      body: req.body,
      file: req.file,
      userId
    });

    if (!userId) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: "Content is required" });
    }

    // Handle image upload
    let image = undefined;
    if (req.file) {
      image = {
        url: req.file.path, // Cloudinary URL
        filename: req.file.filename, // Cloudinary public_id
      };
      console.log("Image uploaded successfully:", image);
    }

    const post = new Post({
      content: content.trim(),
      author: userId,
      image,
    });

    await post.save();

    // Populate author info for response
    await post.populate('author', 'username profilePhoto IsVerified');

    console.log("Post created successfully:", post._id);

    // Notify followers (existing notification code)
    const User = require('../models/User');
    const author = await User.findById(userId);
    if (author && author.followers && author.followers.length > 0) {
      const notificationController = require('../controller/notification.controller');
      for (const followerId of author.followers) {
        await notificationController.createNotification({
          user: followerId,
          type: 'post',
          fromUser: userId,
          post: post._id,
          message: 'created a new post',
        });
      }
    }

    return res.status(201).json({ success: true, post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ 
      success: false, 
      error: "An error occurred while creating the post.",
      details: error.message 
    });
  }
};


const getEditPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user ? req.user._id : req.session.userId;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).render("404", { error: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).render("403", { error: "Forbidden" });
    }

    res.json({ post, user: req.user });
  } catch (error) {
    console.error("Error loading edit post page:", error);
    res.status(500).json({ error: error.message });
  }
};

const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user ? req.user._id : req.session.userId;

    // Debug: log file and body info
    console.log("Edit Post Debug:", {
      postId,
      userId,
      content,
      file: req.file,
      body: req.body,
    });

    if (!content) {
      return res.status(400).render("editepost", {
        error: "Content is required",
        user: req.user,
        post: { _id: postId, content },
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).render("404", { error: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).render("403", { error: "Forbidden" });
    }

    // Handle image update or deletion
    if (req.body.deleteImage === "1") {
      // User requested to delete the image
      if (
        post.image &&
        post.image.url &&
        post.image.filename &&
        post.image.url.startsWith("http")
      ) {
        try {
          await cloudinary.uploader.destroy(post.image.filename);
        } catch (imgErr) {
          console.error("Error deleting post image from Cloudinary:", imgErr);
        }
      }
      post.image = undefined;
      post.content = content;
      
      try {
        await post.save();
      } catch (saveError) {
        console.error("Error saving post:", saveError);
        return res.status(500).render("editepost", {
          error:
            saveError && saveError.stack
              ? saveError.stack
              : saveError && saveError.message
              ? saveError.message
              : "An error occurred while saving the post.",
          user: req.user,
          post: { _id: req.params.id, content: req.body.content },
        });
      }

      // Re-render the edit page with updated post (no redirect)
      const updatedPost = await Post.findById(postId);
      return res.json({ post: updatedPost, user: req.user });
    } else if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (
        post.image &&
        post.image.url &&
        post.image.filename &&
        post.image.url.startsWith("http")
      ) {
        try {
          await cloudinary.uploader.destroy(post.image.filename);
        } catch (imgErr) {
          console.error(
            "Error deleting old post image from Cloudinary:",
            imgErr
          );
        }
      }

      post.image = {
        url: req.file.path, // Cloudinary URL
        filename: req.file.filename, // Cloudinary public_id
      };
      console.log("Updated post.image:", post.image);
    } else if (!post.image) {
      // If no image uploaded and no image object, set image to undefined
      post.image = undefined;
    }

    post.content = content;
    
    try {
      await post.save();
    } catch (saveError) {
      console.error("Error saving post:", saveError);
      return res.status(500).render("editepost", {
        error:
          saveError && saveError.stack
            ? saveError.stack
            : saveError && saveError.message
            ? saveError.message
            : "An error occurred while saving the post.",
        user: req.user,
        post: { _id: req.params.id, content: req.body.content },
      });
    }

    // If this is an API request, respond with JSON
    return res.json({ post, user: req.user });
  } catch (error) {
    console.error("Error updating post:", error);
    // Print full error stack for debugging
    res.status(500).render("editepost", {
      error:
        error && error.stack
          ? error.stack
          : error && error.message
          ? error.message
          : "An error occurred while updating the post.",
      user: req.user,
      post: { _id: req.params.id, content: req.body.content },
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user ? req.user._id : req.session.userId;

    if (!userId) {
      console.error("User ID is missing. Cannot delete post.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      console.error("Post not found:", postId);
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      console.error("User is not authorized to delete this post:", userId);
      return res.status(403).json({ error: "Forbidden" });
    }

    // Replies are subdocuments; deleting the post removes them automatically
    // Delete image from storage/cloud if present
    if (post.image && post.image.url && post.image.filename) {
      try {
        // If using Cloudinary (URL starts with http and filename exists)
        if (post.image.url.startsWith("http") && post.image.filename) {
          await cloudinary.uploader.destroy(post.image.filename);
        } else if (post.image.filename) {
          // If using local storage, remove file from /public/images
          const fs = require("fs");
          const path = require("path");
          const imagePath = path.join(
            __dirname,
            "public",
            "images",
            post.image.filename
          );
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      } catch (imgErr) {
        console.error("Error deleting post image:", imgErr);
      }
    }

    await Post.findByIdAndDelete(postId);
    console.log(`Post ${postId} deleted successfully by user ${userId}`);

    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      return res
        .status(200)
        .json({ success: true, message: "Post deleted successfully" });
    } else {
      return res.redirect("/");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    if (req.xhr || req.headers.accept.indexOf("json") > -1) {
      res.status(500).json({ error: "An error occurred" });
    } else {
      res.redirect("/");
    }
  }
};

const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user ? req.user._id : req.session.userId;

    if (!userId) {
      console.error("User ID is missing. Cannot toggle like.");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      console.error("Post not found:", postId);
      return res.status(404).json({ error: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like the post
      post.likes.push(userId);
    }

    await post.save();

    console.log(
      `Post ${postId} successfully ${
        isLiked ? "unliked" : "liked"
      } by user ${userId}`
    );

    res.status(200).json({
      success: true,
      likesCount: post.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ error: "An error occurred" });
  }
};

const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user ? req.user._id : req.session.userId;

    const user = await User.findById(userId);
    if (!user)
      return res.status(401).json({ success: false, error: "User not found" });

    if (!user.bookmarks) user.bookmarks = [];

    const index = user.bookmarks.findIndex((b) => b.toString() === postId);
    let isBookmarked;

    if (index > -1) {
      // Remove bookmark
      user.bookmarks.splice(index, 1);
      isBookmarked = false;
    } else {
      // Add bookmark only if not already present
      if (!user.bookmarks.some((b) => b.toString() === postId)) {
        user.bookmarks.push(postId);
      }
      isBookmarked = true;
    }

    await user.save();
    res.json({ success: true, isBookmarked });
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to toggle bookmark" });
  }
};

const getSinglePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "username name profilePhoto IsVerified")
      .lean();

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ post, currentUser: req.user || null });
  } catch (err) {
    res.status(500).json({ message: "Error loading post" });
  }
};

// Add a reply to a post
const addReply = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user ? req.user._id : req.session.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Validate content
    const IsVerified = user.IsVerified;
    if (!content) {
      return res.status(400).json({ error: 'Reply content cannot be empty.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    // Add the reply as a subdocument
    post.replies.push({
      content,
      author: userId,
      IsVerified
    });

    console.log('Reply content:', content);
    console.log('Reply author:', userId);
    console.log('is verified:', IsVerified);

    await post.save();

    // Notify post author if not commenting on own post
    if (post.author.toString() !== userId.toString()) {
      const notificationController = require('../controller/notification.controller');
      await notificationController.createNotification({
        user: post.author,
        type: 'comment',
        fromUser: userId,
        post: post._id,
        message: 'commented on your post',
      });
    }

    res.status(201).json({ success: true, message: 'Reply added successfully.' });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'An error occurred while adding the reply.' });
  }
};

// Like/unlike a comment
const likeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user ? req.user._id : req.session.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found." });
    }

    // Find the reply by its _id
    const reply = post.replies.id(commentId);
    if (!reply) {
      return res
        .status(404)
        .json({ success: false, error: "Comment not found." });
    }

    // Toggle like
    const likeIndex = reply.likes.findIndex(
      (id) => id.toString() === userId.toString()
    );
    let isLiked;

    if (likeIndex === -1) {
      reply.likes.push(userId);
      isLiked = true;
    } else {
      reply.likes.splice(likeIndex, 1);
      isLiked = false;
    }

    await post.save();
    res.json({ success: true, isLiked, likesCount: reply.likes.length });
  } catch (error) {
    console.error("Error toggling comment like:", error);
    res
      .status(500)
      .json({
        success: false,
        error: "An error occurred while toggling comment like.",
      });
  }
};

// Edit a comment
const editComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user ? req.user._id : req.session.userId;

    if (!content) {
      return res.status(400).json({ success: false, error: 'Content cannot be empty.' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    const reply = post.replies.id(commentId);
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    if (reply.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    reply.content = content;
    await post.save();

    // Remove populate, as subdocs do not support it
    res.json({ success: true, updatedComment: reply });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ success: false, error: 'An error occurred while editing the comment.' });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user ? req.user._id : req.session.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    const reply = post.replies.id(commentId);
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    // Allow delete if user is comment author OR post author
    if (reply.author.toString() !== userId.toString() && post.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    // Use Mongoose's subdocument remove method
    post.replies.id(commentId).deleteOne();
    await post.save();

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, error: 'An error occurred while deleting the comment.' });
  }
};

// FIXED: Single export with all functions
module.exports = {
  getNewPost,
  createPost,
  getEditPost,
  updatePost,
  deletePost,
  likePost,
  bookmarkPost,
  getSinglePost,
  addReply,
  getComments, // Now using the renamed function
  likeComment,
  editComment,
  deleteComment,
};
