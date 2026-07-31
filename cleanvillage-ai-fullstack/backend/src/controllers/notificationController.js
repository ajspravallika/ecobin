const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc    List notifications (newest first), optional ?read=true/false filter
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.read !== undefined) query.read = req.query.read === 'true';

  const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(200);
  const unreadCount = await Notification.countDocuments({ read: false });

  res.status(200).json({ success: true, count: notifications.length, unreadCount, data: notifications });
});

// @desc    Mark a single notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.status(200).json({ success: true, data: notification });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

// @desc    Dismiss (delete) a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const dismissNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }
  res.status(200).json({ success: true, message: 'Notification dismissed' });
});

module.exports = { getNotifications, markAsRead, markAllAsRead, dismissNotification };
