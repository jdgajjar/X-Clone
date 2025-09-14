const Message = require('../models/Message');

// Delete all messages in a chat for current user only ("Empty chat for you")
exports.emptyChatForMe = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.session.userId;
    const { chatUserId } = req.body; // The other user's id
    if (!chatUserId) return res.status(400).json({ error: 'chatUserId required' });

    // Find all messages between userId and chatUserId
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: chatUserId },
        { sender: chatUserId, receiver: userId }
      ]
    });

    // For each message, add userId to deletedFor if not already present
    for (const message of messages) {
      if (!message.deletedFor) message.deletedFor = [];
      if (!message.deletedFor.some(id => id.toString() === userId.toString())) {
        message.deletedFor.push(userId);
        await message.save();
      }
      // If both participants deleted, remove from DB
      const allParticipants = [message.sender.toString(), message.receiver.toString()];
      const deletedForSet = new Set((message.deletedFor || []).map(id => id.toString()));
      const allDeleted = allParticipants.every(uid => deletedForSet.has(uid));
      if (allDeleted) {
        await Message.findByIdAndDelete(message._id);
      }
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to empty chat for user' });
  }
};
