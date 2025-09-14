const Message = require('../models/Message');

// Mark all messages from selected user as read for the current user
const markMessagesRead = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const fromUserId = req.body.fromUserId;
    if (!fromUserId) return res.status(400).json({ error: 'fromUserId required' });
    // Find unread messages
    const unreadMessages = await Message.find({ sender: fromUserId, receiver: userId, read: false });
    await Message.updateMany({ sender: fromUserId, receiver: userId, read: false }, { $set: { read: true } });
    // Emit socket event for real-time update (if io is available)
    if (req.app && req.app.get('io')) {
      unreadMessages.forEach(msg => {
        req.app.get('io').to(userId.toString()).emit('messageRead', { messageId: msg._id, fromUserId });
      });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

// Get read/unread message counts for the current user
const getMessageCounts = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const unreadCount = await Message.countDocuments({ receiver: userId, read: false });
    const readCount = await Message.countDocuments({ receiver: userId, read: true });
    res.json({ read: readCount, unread: unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get message counts' });
  }
};

// API: Get unread message counts per user for the current user
const getUnreadCountsPerUser = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    console.log('UnreadCounts API: userId =', userId);
    // Group unread messages by sender
    // Ensure userId is an ObjectId for aggregation
    const mongoose = require('mongoose');
    // Fix: Use mongoose.Types.ObjectId as a function, not a constructor
    const receiverId = (typeof userId === 'string' && userId.length === 24)
      ? mongoose.Types.ObjectId.createFromHexString(userId)
      : userId;
    const pipeline = [
      { $match: { receiver: receiverId, read: false } },
      { $group: { _id: "$sender", count: { $sum: 1 } } }
    ];
    const results = await Message.aggregate(pipeline);
    // Log all unread messages for this user
    const unreadMessages = await Message.find({ receiver: userId, read: false });
    console.log('UnreadCounts API: aggregation results =', results);
    console.log('UnreadCounts API: unread messages for user', userId, '=', unreadMessages);
    const counts = {};
    results.forEach(r => { counts[r._id] = r.count; });
    res.json({ counts });
  } catch (err) {
    console.error('UnreadCounts API error:', err);
    res.status(500).json({ error: 'Failed to get unread counts' });
  }
};

module.exports = {
  markMessagesRead,
  getMessageCounts,
  getUnreadCountsPerUser
};
