// routes/homeworkRoutes.js
const express    = require("express");
const router     = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware"); // ✅ matches your existing routes
const {
  createHomework,
  getHomeworkByTeacher,
  getHomeworkForStudent,
  deleteHomework,
} = require("../controllers/homeworkController");

// Teacher routes
router.post  ("/",        protect, authorizeRoles("teacher"), createHomework);
router.get   ("/teacher", protect, authorizeRoles("teacher"), getHomeworkByTeacher);
router.delete("/:id",     protect, authorizeRoles("teacher"), deleteHomework);

// Student route
router.get   ("/student", protect, authorizeRoles("student"), getHomeworkForStudent);

module.exports = router;