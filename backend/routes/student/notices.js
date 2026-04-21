// routes/student/notices.js

const express = require("express");
const router  = express.Router();
const { protect, authorizeRoles } = require("../../middleware/authMiddleware");
const { getStudentNotices } = require("../../controllers/student/noticesController");

router.use(protect, authorizeRoles("student"));

router.get("/", getStudentNotices);

module.exports = router;