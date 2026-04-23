const express = require("express");
const router  = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
 
const {
  getProfile,
  getClasses,
  getStudents,
  markAttendance,
  createAssignment,
  addResult,
  getTimetable,
  updateStudentFee,
   getHomeworkClasses,
} = require("../controllers/teacherController");
 
router.use(protect, authorizeRoles("teacher"));
 
router.get ("/profile",            getProfile);
router.get ("/classes",            getClasses);
router.get ("/students",           getStudents);
router.get ("/timetable",          getTimetable);     // ← NEW
router.get("/homework-classes", getHomeworkClasses);
router.put ("/fees/:studentId",    updateStudentFee); // ← NEW
router.post("/attendance",         markAttendance);
router.post("/assignments",        createAssignment);
router.post("/results",            addResult);

 
module.exports = router;