const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Must be ngo or municipal
    required: true,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Administrator
    required: true,
  },
  status: {
    type: String,
    enum: ["assigned", "accepted", "completed"],
    default: "assigned",
  },
  notes: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("Assignment", AssignmentSchema);