const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const notificationController = require('../controller/notification.controller');

// Get notifications for current user
router.get('/api/notifications', isAuthenticated, notificationController.getNotifications);
// Mark all notifications as read
router.post('/api/notifications/mark-all-read', isAuthenticated, notificationController.markAllRead);

module.exports = router;
