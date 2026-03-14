const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint", // Optional, if related to a specific complaint
  },
}, { timestamps: true });

module.exports = mongoose.model("Notification", NotificationSchema);