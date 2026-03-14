const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: true,
  },
  citizen: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comments: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("Feedback", FeedbackSchema);