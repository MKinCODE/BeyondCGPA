const Notification = require('../models/Notification');

/**
 * Get all user notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { notificationId } = req.params;

    if (notificationId === 'all') {
      await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
    } else {
      await Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { isRead: true });
    }

    res.status(200).json({
      success: true,
      message: 'Marked as read'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
