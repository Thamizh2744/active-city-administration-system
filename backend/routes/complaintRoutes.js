const express = require("express");
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
} = require("../controllers/complaintController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, authorize("citizen"), createComplaint)
  .get(protect, authorize("administrator", "municipal", "ngo"), getComplaints);

router.route("/my").get(protect, authorize("citizen"), getMyComplaints);

router.route("/:id").get(protect, getComplaintById);

router.route("/:id/status").put(
  protect,
  authorize("administrator", "municipal", "ngo"),
  updateComplaintStatus
);

module.exports = router;