const router = require("express").Router();
const { register, login, getMe, getAuthorities } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/authorities", protect, getAuthorities);

module.exports = router;