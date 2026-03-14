const express = require("express");
const router = express.Router();
const { createCategory, getCategories } = require("../controllers/categoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.route("/")
  .post(protect, authorize("administrator"), createCategory)
  .get(getCategories); // Made public so citizen can select when creating complaint

module.exports = router;
