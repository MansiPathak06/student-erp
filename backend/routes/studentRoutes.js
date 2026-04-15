const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getProfile, getAttendance, getResults, getFees, getAssignments, getTimetable } = require("../controllers/studentController");

router.use(protect, authorizeRoles("student"));

router.get("/profile", getProfile);
router.get("/attendance", getAttendance);
router.get("/results", getResults);
router.get("/fees", getFees);
router.get("/assignments", getAssignments);
router.get("/timetable", getTimetable);

module.exports = router;