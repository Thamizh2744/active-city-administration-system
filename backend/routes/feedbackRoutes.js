const express = require("express");
const router = express.Router();
const { addFeedback, getFeedback } = require("../controllers/feedbackController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, authorize("citizen"), addFeedback);

router.route("/:complaintId")
  .get(protect, getFeedback);

module.exports = router;