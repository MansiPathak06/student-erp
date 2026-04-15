const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getDashboard, getAllStudents, createStudent, updateStudent,
  deleteStudent, getAllTeachers, createTeacher
} = require("../controllers/adminController");

router.use(protect, authorizeRoles("admin"));

router.get("/dashboard", getDashboard);
router.get("/students", getAllStudents);
router.post("/students", createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);
router.get("/teachers", getAllTeachers);
router.post("/teachers", createTeacher);

module.exports = router;