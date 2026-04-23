const pool     = require("../config/db");
const express  = require("express");
const router   = express.Router();
const path     = require("path");
const fs       = require("fs");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ── Import upload middleware (for students photos)
const studentUpload = require("../middleware/upload");   // uploads/students/

// ── Multer for teacher profile pictures (separate config)
const multer = require("multer");
const uploadDir = path.join(__dirname, "../uploads/teachers");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const teacherStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req,  file, cb) => {
    const ext  = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const teacherUpload = multer({
  storage: teacherStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error("Only image files are allowed"));
  },
});

// ── Controllers
const {
  getDashboard,
  getStudentMeta,
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  uploadStudentPhoto, 
    // ← make sure this is exported from adminController
} = require("../controllers/adminController");

const {
  getAllTeachers, getTeacherMeta, createTeacher, deleteTeacher, updateTeacher,
} = require("../controllers/teacherController");

const {
  getAllClasses, getClassMeta, createClass, updateClass, deleteClass,checkTeacherClassAssignment,
} = require("../controllers/classController");

// ── Auth guard for ALL admin routes
router.use(protect, authorizeRoles("admin"));

// ── Dashboard
router.get("/dashboard", getDashboard);

// ── Students  (IMPORTANT: /meta must come before /:id)
router.get   ("/students/meta",        getStudentMeta);
router.get   ("/students",             getAllStudents);
router.post  ("/students",             createStudent);
router.put   ("/students/:id",         updateStudent);
router.delete("/students/:id",         deleteStudent);
router.post  ("/students/:id/photo",   studentUpload.single("photo"), uploadStudentPhoto);
router.get("/teachers/check-class", checkTeacherClassAssignment);
// Attendance trend for last N days
router.get("/attendance/trend", async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(date, 'DD Mon') AS date,
        ROUND(
          COUNT(*) FILTER (WHERE status = 'Present') * 100.0 / NULLIF(COUNT(*), 0),
          1
        ) AS rate
      FROM attendance
      WHERE date >= CURRENT_DATE - ($1 * INTERVAL '1 day')
      GROUP BY date
      ORDER BY date
    `, [days]);
    res.json({ data: rows });
  } catch (err) {
    console.error("attendance/trend error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── Teachers
router.get   ("/teachers/meta",        getTeacherMeta);
router.get   ("/teachers",             getAllTeachers);
router.post  ("/teachers",             teacherUpload.single("profilePicture"), createTeacher);
router.put   ("/teachers/:id",         teacherUpload.single("profilePicture"), updateTeacher);
router.delete("/teachers/:id",         deleteTeacher);

// ── Classes
router.get   ("/classes/meta",         getClassMeta);
router.get   ("/classes",              getAllClasses);
router.post  ("/classes",              createClass);
router.put   ("/classes/:id",          updateClass);
router.delete("/classes/:id",          deleteClass);

module.exports = router;