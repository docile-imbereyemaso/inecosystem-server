// src/controllers/notificationController.js
import Notification from '../models/Notification.js';

// ✅ Create a notification
export const createNotification = async (req, res) => {
  try {
    const { title, message, recipient_type, recipient_id, data } = req.body;

    const notification = await Notification.create({
      title,
      message,
      recipient_type,
      recipient_id: recipient_type === 'user' ? recipient_id : null,
      data
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// ✅ Get all notifications

export const getAllNotifications = async (req, res) => {
  const userId = req.user ? req.user.user_id : null;
  
  try {
    // Get all notifications for the user
    const notifications = await Notification.findAll({
      where: userId ? { recipient_id: userId } : { recipient_type: 'general' },
      order: [['createdAt', 'DESC']]
    });

    // Count unread notifications
    const unreadCount = await Notification.count({
      where: {
        ...(userId ? { recipient_id: userId } : { recipient_type: 'general' }),
        is_read: false
      }
    });

    res.json({
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// ✅ Get notifications by recipient (user/general)
export const getNotificationsByRecipient = async (req, res) => {
  try {
    const { recipient_type, recipient_id } = req.query;

    const where = recipient_type === 'user'
      ? { recipient_type, recipient_id }
      : { recipient_type };

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// ✅ Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByPk(id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    notification.is_read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

// ✅ Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Notification.destroy({ where: { notification_id: id } });
    if (!deleted) return res.status(404).json({ error: 'Notification not found' });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};
