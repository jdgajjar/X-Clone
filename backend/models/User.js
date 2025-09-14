const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    profilePhoto: {  
        url: { type: String },
        filename: { type: String }
      },
    coverPhoto: {   
        url: { type: String },
        filename: { type: String }
       },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId }], // Array of comment/reply IDs authored by this user
    IsVerified: { type: Boolean, default: true },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users this user has blocked
    blockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Users who have blocked this user
    
});

// Optionally, add a method to check if a post is bookmarked
userSchema.methods.isBookmarked = function(postId) {
  return this.bookmarks.some(b => b.toString() === postId.toString());
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;