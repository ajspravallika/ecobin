const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', dismissNotification);

module.exports = router;
