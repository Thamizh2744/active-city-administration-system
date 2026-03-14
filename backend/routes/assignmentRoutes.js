const express = require("express");
const router = express.Router();
const {
  createAssignment,
  getMyAssignments,
  updateAssignmentStatus,
} = require("../controllers/assignmentController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, authorize("administrator"), createAssignment);

router.route("/my")
  .get(protect, authorize("municipal", "ngo"), getMyAssignments);

router.route("/:id/status")
  .put(protect, authorize("administrator", "municipal", "ngo"), updateAssignmentStatus);

module.exports = router;
