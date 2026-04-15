const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getDashboard, getAllStudents, createStudent, updateStudent,
  deleteStudent,
} = require("../controllers/adminController");
const { getAllTeachers, getTeacherMeta } = require("../controllers/teacherController");

router.use(protect, authorizeRoles("admin"));

router.get("/dashboard", getDashboard);
router.get("/students", getAllStudents);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);


// Add inside your admin router (already has protect + authorizeRoles("admin"))
router.get("/teachers",      getAllTeachers);
router.get("/teachers/meta", getTeacherMeta);

module.exports = router;