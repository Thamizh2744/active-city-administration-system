const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  locationDetails: {
    area: { type: String, required: true },
    ward: { type: String, required: true },
  },
  images: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ["pending", "assigned", "in-progress", "resolved", "rejected"],
    default: "pending",
  },
  urgency: {
    type: String,
    enum: ["low", "medium", "high", "critical"],
    default: "medium",
  },
}, { timestamps: true });

module.exports = mongoose.model("Complaint", ComplaintSchema);