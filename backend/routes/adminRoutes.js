const express  = require("express");
const router   = express.Router();
const multer   = require("multer");
const path     = require("path");
const fs       = require("fs");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  getDashboard, getAllStudents, createStudent, updateStudent, deleteStudent,
} = require("../controllers/adminController");

const {
  getAllTeachers, getTeacherMeta, createTeacher, deleteTeacher,updateTeacher,
} = require("../controllers/teacherController");

const {
  getAllClasses, getClassMeta, createClass, updateClass, deleteClass,
} = require("../controllers/classController");

// ── Multer: profile picture upload ──────────────────────────────────────────
const uploadDir = path.join(__dirname, "../uploads/teachers");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req,  file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },          // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
               allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Only image files are allowed"));
  },
});

// ── Auth guard for all admin routes ─────────────────────────────────────────
router.use(protect, authorizeRoles("admin"));

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get("/dashboard", getDashboard);

// ── Students ─────────────────────────────────────────────────────────────────
router.get("/students",        getAllStudents);
router.post("/students",       createStudent);
router.put("/students/:id",    updateStudent);
router.delete("/students/:id", deleteStudent);

// ── Teachers ─────────────────────────────────────────────────────────────────
// NOTE: /meta must come before /:id so Express doesn't treat "meta" as an id
router.get("/teachers/meta",   getTeacherMeta);
router.get("/teachers",        getAllTeachers);
router.post("/teachers",       upload.single("profilePicture"), createTeacher);
router.put("/teachers/:id",    upload.single("profilePicture"), updateTeacher);
router.delete("/teachers/:id", deleteTeacher);

// ── Classes ──────────────────────────────────────────────────────────────────
router.get("/classes/meta",    getClassMeta);
router.get("/classes",         getAllClasses);
router.post("/classes",        createClass);
router.put("/classes/:id",     updateClass);
router.delete("/classes/:id",  deleteClass);

module.exports = router;