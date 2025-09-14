// Edit message content (sender only)
exports.editMessage = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const { messageId, content } = req.body;
    if (!messageId || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Message ID and new content required' });
    }
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to edit this message' });
    }
    message.content = content;
    await message.save();
    // Real-time: emit to both sender and receiver
    const io = req.app.get('io');
    if (io) {
      io.to(message.sender.toString()).emit('messageEdited', message);
      io.to(message.receiver.toString()).emit('messageEdited', message);
    }
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to edit message' });
  }
};
const Message = require('../models/Message');
const User = require('../models/User');

// Share post link to selected users via message
exports.shareMessage = async (req, res) => {
  try {
    const senderId = req.user ? req.user._id : req.session.userId;
    const { postId, userIds, link } = req.body;
    if (!postId || !Array.isArray(userIds) || userIds.length === 0 || !link) {
      return res.status(400).json({ error: 'postId, userIds, and link required' });
    }
    // Send a message to each selected user
    const results = [];
    for (const receiverId of userIds) {
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content: `Check out this post: ${link}`,
        post: postId,
        createdAt: new Date(),
      });
      await message.save();
      results.push(message);
    }
    res.json({ success: true, shared: results.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to share post link' });
  }
};
// Delete message for current user only ("Delete for you")
exports.deleteMessageForMe = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const { messageId } = req.body;
    if (!messageId) return res.status(400).json({ error: 'Message ID required' });
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    // Only add userId if not already present
    if (!message.deletedFor) message.deletedFor = [];
    if (!message.deletedFor.some(id => id.toString() === userId.toString())) {
      message.deletedFor.push(userId);
      await message.save();
    }

    // 1-to-1 chat: if both sender and receiver have deleted, remove from DB
    const allParticipants = [message.sender.toString(), message.receiver.toString()];
    const deletedForSet = new Set((message.deletedFor || []).map(id => id.toString()));
    const allDeleted = allParticipants.every(uid => deletedForSet.has(uid));
    if (allDeleted) {
      await Message.findByIdAndDelete(messageId);
      return res.json({ success: true, deleted: true });
    }

    res.json({ success: true, deleted: false });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message for user' });
  }
};
