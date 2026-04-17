const express = require("express");
const router = express.Router();
const { login, register, getMe,forgotPassword, 
  verifyOTP, 
  resetPassword  } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/register", protect, authorizeRoles("admin"), register);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

module.exports = router;