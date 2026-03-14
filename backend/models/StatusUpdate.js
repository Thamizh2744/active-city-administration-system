const mongoose = require("mongoose");

const StatusUpdateSchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  oldStatus: {
    type: String,
  },
  newStatus: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("StatusUpdate", StatusUpdateSchema);