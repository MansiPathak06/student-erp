const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getProfile, getClasses, getStudents, markAttendance, createAssignment, addResult } = require("../controllers/teacherController");

router.use(protect, authorizeRoles("teacher"));

router.get("/profile", getProfile);
router.get("/classes", getClasses);
router.get("/students", getStudents);
router.post("/attendance", markAttendance);
router.post("/assignments", createAssignment);
router.post("/results", addResult);

module.exports = router;