const Notification = require("../models/Notification");

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (notification) {
      if (notification.user.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      notification.isRead = true;
      const updatedNotification = await notification.save();
      res.json(updatedNotification);
    } else {
      res.status(404).json({ message: "Notification not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create notification
// Helper function to be used by other controllers internally
exports.createInternalNotification = async (userId, message, complaintId = null) => {
  try {
    await Notification.create({
      user: userId,
      message,
      complaint: complaintId,
    });
  } catch (error) {
    console.error("Failed to default notification", error);
  }
};