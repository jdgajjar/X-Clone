const mongoose = require('mongoose');


const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who receives the notification
  type: { type: String, enum: ['follow', 'post', 'comment'], required: true },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // who triggered the notification
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // related post (if any)
  message: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expireAt: { type: Date, required: true, index: { expires: 0 } } // TTL index: auto-delete when expired
});

module.exports = mongoose.model('Notification', notificationSchema);
