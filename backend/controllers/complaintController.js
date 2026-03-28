const Complaint = require("../models/Complaint");
const StatusUpdate = require("../models/StatusUpdate");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendSMS } = require("../utils/sms");

// @desc    Create new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, locationDetails, images, urgency } = req.body;

    const complaint = new Complaint({
      title,
      description,
      citizen: req.user.id,
      category,
      locationDetails,
      images,
      urgency,
    });

    const createdComplaint = await complaint.save();

    // Send notification to all administrators
    const admins = await User.find({ role: "administrator" });
    const notifications = [];
    
    for (const admin of admins) {
      notifications.push({
        user: admin._id,
        message: `A new complaint has been submitted: ${title}`,
        complaint: createdComplaint._id,
      });

      // Send Mock SMS to Administrator
      if (admin.phone) {
        await sendSMS(admin.phone, `A new complaint has been submitted: ${title} - ${urgency} urgency.`);
      }
    }
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json(createdComplaint);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin, Municipal, NGO)
exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("citizen", "name email phone")
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/my
// @access  Private (Citizen)
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user.id })
      .populate("category", "name")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("citizen", "name email phone")
      .populate("category", "name");

    if (complaint) {
      if (req.user.role === "citizen" && complaint.citizen._id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to view this complaint" });
      }
      res.json(complaint);
    } else {
      res.status(404).json({ message: "Complaint not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin, Municipal, NGO)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status, remarks, resolutionProof } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
      const oldStatus = complaint.status;
      complaint.status = status;

      // Save resolution proof if resolving
      if (status === "resolved" && resolutionProof) {
        complaint.resolutionProof = {
          note: resolutionProof.note || "",
          image: resolutionProof.image || null,
          resolvedBy: req.user.name || req.user.id,
          resolvedAt: new Date(),
        };
      }

      const updatedComplaint = await complaint.save();

      // Record status update
      await StatusUpdate.create({
        complaint: complaint._id,
        updatedBy: req.user.id,
        oldStatus,
        newStatus: status,
        remarks,
      });

      // SMS to Citizen if resolved
      if (status === "resolved") {
        await complaint.populate("citizen");
        if (complaint.citizen && complaint.citizen.phone) {
          await sendSMS(
            complaint.citizen.phone, 
            `Your complaint "${complaint.title}" has been resolved. Please log in to provide feedback and view the resolution proof.`
          );
        }
      }

      res.json(updatedComplaint);
    } else {
      res.status(404).json({ message: "Complaint not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};