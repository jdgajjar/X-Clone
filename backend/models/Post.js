const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    IsVerified: { type: Boolean, default: false }, // Uppercase for consistency
    edited: { type: Boolean, default: false }
});

const postSchema = new mongoose.Schema({
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    image: { 
        url: { type: String },
        filename: { type: String }
    },
    replies: [replySchema],
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

module.exports = Post;