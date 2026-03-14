const express = require("express");
const router = express.Router();
const { createLocation, getLocations } = require("../controllers/locationController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, authorize("administrator"), createLocation)
  .get(getLocations); // Made public for complaint creation

module.exports = router;
