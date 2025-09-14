const Notification = require('../models/Notification');
const User = require('../models/User');
const Post = require('../models/Post');

// Create notification
exports.createNotification = async ({ user, type, fromUser, post, message }) => {
  // Set expireAt to 24 hours from now
  const expireAt = new Date(Date.now() + 24*60*60*1000);
  return Notification.create({ user, type, fromUser, post, message, expireAt });
};

// Get notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'fromUser',
        select: 'username avatar profilePhoto',
      })
      .populate('post', 'content')
      .lean();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark all as read
exports.markAllRead = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await Notification.updateMany({ user: userId, read: false }, { read: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};
