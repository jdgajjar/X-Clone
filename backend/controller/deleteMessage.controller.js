const Message = require('../models/Message');

// Delete message for everyone (permanently)
exports.deleteMessageForEveryone = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const { messageId } = req.body;
    if (!messageId) return res.status(400).json({ error: 'Message ID required' });
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });
    // Only sender or receiver can delete for everyone
    if (
      message.sender.toString() !== userId.toString() &&
      message.receiver.toString() !== userId.toString()
    ) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await Message.findByIdAndDelete(messageId);
    // Real-time: notify both sender and receiver
    const io = req.app.get('io');
    if (io) {
      io.to(message.sender.toString()).emit('messageDeleted', { messageId });
      io.to(message.receiver.toString()).emit('messageDeleted', { messageId });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete message for everyone' });
  }
};
