const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  getDashboard, getAllStudents, createStudent, updateStudent, deleteStudent,
} = require("../controllers/adminController");

const { getAllTeachers, getTeacherMeta } = require("../controllers/teacherController");

const {
  getAllClasses, getClassMeta, createClass, updateClass, deleteClass,
} = require("../controllers/classController");

router.use(protect, authorizeRoles("admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// Students
router.get("/students",     getAllStudents);
router.post("/students",    createStudent);
router.put("/students/:id", updateStudent);
router.delete("/students/:id", deleteStudent);

// Teachers
router.get("/teachers",      getAllTeachers);
router.get("/teachers/meta", getTeacherMeta);

// Classes
router.get("/classes",       getAllClasses);
router.get("/classes/meta",  getClassMeta);
router.post("/classes",      createClass);
router.put("/classes/:id",   updateClass);
router.delete("/classes/:id", deleteClass);

module.exports = router;