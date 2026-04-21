// routes/teacher/notices.js

const express = require("express");
const router  = express.Router();
const { protect, authorizeRoles } = require("../../middleware/authMiddleware");
const { getTeacherNotices } = require("../../controllers/teacher/noticesController");

router.use(protect, authorizeRoles("teacher"));

router.get("/", getTeacherNotices);

module.exports = router;