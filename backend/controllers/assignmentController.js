const Assignment = require("../models/Assignment");
const Complaint = require("../models/Complaint");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendSMS } = require("../utils/sms");

// @desc    Assign a complaint
// @route   POST /api/assignments
// @access  Private (Admin)
exports.createAssignment = async (req, res) => {
  try {
    const { complaintId, assignedToId, notes } = req.body;

    const assignment = new Assignment({
      complaint: complaintId,
      assignedTo: assignedToId,
      assignedBy: req.user.id,
      notes,
    });

    const createdAssignment = await assignment.save();

    // Update complaint status
    const complaint = await Complaint.findById(complaintId);
    if (complaint) {
      complaint.status = "assigned";
      await complaint.save();
    }

    // Send Notification to the User (Authority) assigned to
    await Notification.create({
      user: assignedToId,
      message: `You have been assigned a new complaint: ${complaint ? complaint.title : 'Details hidden'}`,
      complaint: complaintId,
    });

    // Send Mock SMS to Assigned Authority
    const assignedUser = await User.findById(assignedToId);
    if (assignedUser && assignedUser.phone) {
      await sendSMS(
        assignedUser.phone,
        `You have been assigned a new complaint: ${complaint ? complaint.title : 'Details hidden'}`
      );
    }

    res.status(201).json(createdAssignment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get assignments for a user
// @route   GET /api/assignments/my
// @access  Private (Municipal, NGO)
exports.getMyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ assignedTo: req.user.id })
      .populate({
        path: "complaint",
        populate: { path: "citizen category", select: "name email phone" }
      })
      .populate("assignedBy", "name")
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update assignment status
// @route   PUT /api/assignments/:id/status
// @access  Private (Municipal, NGO)
exports.updateAssignmentStatus = async (req, res) => {
  try {
    const { status } = req.body; // accepted, completed
    const assignment = await Assignment.findById(req.params.id);

    if (assignment) {
      if (assignment.assignedTo.toString() !== req.user.id && req.user.role !== "administrator") {
        return res.status(403).json({ message: "Not authorized" });
      }

      assignment.status = status;
      const updatedAssignment = await assignment.save();
      res.json(updatedAssignment);
    } else {
      res.status(404).json({ message: "Assignment not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
