const Feedback = require("../models/Feedback");

// @desc    Add feedback to a complaint
// @route   POST /api/feedback
// @access  Private (Citizen)
exports.addFeedback = async (req, res) => {
  try {
    const { complaintId, rating, comments } = req.body;
    
    // Check if feedback already exists for this complaint
    const feedbackExists = await Feedback.findOne({ complaint: complaintId });
    if (feedbackExists) {
      return res.status(400).json({ message: "Feedback already submitted for this complaint" });
    }

    const feedback = await Feedback.create({
      complaint: complaintId,
      citizen: req.user.id,
      rating,
      comments,
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get feedback for a complaint
// @route   GET /api/feedback/:complaintId
// @access  Private
exports.getFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ complaint: req.params.complaintId })
      .populate("citizen", "name");
    
    if (feedback) {
      res.json(feedback);
    } else {
      res.status(404).json({ message: "Feedback not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};