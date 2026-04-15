const express = require("express");
const router = express.Router();
const { login, register, getMe } = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/register", protect, authorizeRoles("admin"), register);
router.get("/me", protect, getMe);

module.exports = router;