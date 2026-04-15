const pool = require("../config/db");

// ── Helpers ──────────────────────────────────────────────────────────────────

// Derive avatar initials from a name
const getInitials = (name = "") =>
  name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

// Map subject → Tailwind color pair (matches your frontend palette)
const SUBJECT_COLORS = {
  Physics:       { bg: "bg-violet-100",  text: "text-violet-700"  },
  Mathematics:   { bg: "bg-sky-100",     text: "text-sky-700"     },
  English:       { bg: "bg-rose-100",    text: "text-rose-700"    },
  Chemistry:     { bg: "bg-emerald-100", text: "text-emerald-700" },
  History:       { bg: "bg-amber-100",   text: "text-amber-700"   },
  Statistics:    { bg: "bg-indigo-100",  text: "text-indigo-700"  },
  "Fine Arts":   { bg: "bg-pink-100",    text: "text-pink-700"    },
  "Physical Ed.":{ bg: "bg-teal-100",    text: "text-teal-700"    },
  Biology:       { bg: "bg-green-100",   text: "text-green-700"   },
};

const AVATAR_COLORS = [
  "bg-violet-500","bg-sky-500","bg-rose-500","bg-emerald-500",
  "bg-amber-500","bg-indigo-500","bg-pink-500","bg-teal-500",
];

const getSubjectColors = (subject) =>
  SUBJECT_COLORS[subject] ?? { bg: "bg-gray-100", text: "text-gray-700" };

const getAvatarColor = (id) =>
  AVATAR_COLORS[id % AVATAR_COLORS.length];

// ── Admin: GET /api/admin/teachers ───────────────────────────────────────────

const getAllTeachers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.id,
        t.employee_id,
        t.subject,
        t.department,
        t.experience,
        t.status,
        t.pending_tasks,
        t.date_of_joining,
        u.name,
        u.email,
        COALESCE(
          json_agg(
            json_build_object('id', c.id, 'name', c.class_name || '-' || c.section)
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS classes
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN classes c ON c.teacher_id = t.id
      GROUP BY t.id, u.name, u.email
      ORDER BY t.id
    `);

    const teachers = result.rows.map((t) => {
      const { bg, text } = getSubjectColors(t.subject);
      return {
        id:           t.employee_id || `TCH-${String(t.id).padStart(3, "0")}`,
        dbId:         t.id,
        name:         t.name,
        email:        t.email,
        avatar:       getInitials(t.name),
        avatarColor:  getAvatarColor(t.id),
        department:   t.department   || "—",
        subject:      t.subject      || "—",
        subjectBg:    bg,
        subjectText:  text,
        classes:      (t.classes || []).map(c => c.name),
        experience:   t.experience   || 0,
        attendance:   0,              // extend later with real attendance table query
        status:       t.status       || "Active",
        pendingTasks: t.pending_tasks || 0,
      };
    });

    res.json(teachers);
  } catch (err) {
    console.error("getAllTeachers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Admin: GET /api/admin/teachers/meta ──────────────────────────────────────
// Returns distinct departments + subjects for filter dropdowns (no hardcoding)

const getTeacherMeta = async (req, res) => {
  try {
    const deps  = await pool.query("SELECT DISTINCT department FROM teachers WHERE department IS NOT NULL ORDER BY department");
    const subjs = await pool.query("SELECT DISTINCT subject    FROM teachers WHERE subject    IS NOT NULL ORDER BY subject");

    res.json({
      departments: deps.rows.map(r => r.department),
      subjects:    subjs.rows.map(r => r.subject),
    });
  } catch (err) {
    console.error("getTeacherMeta:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Teacher: GET /api/teacher/profile ────────────────────────────────────────

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name, u.email
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Profile not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("getProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Teacher: GET /api/teacher/classes ────────────────────────────────────────

const getClasses = async (req, res) => {
  try {
    const teacher = await pool.query(
      "SELECT id FROM teachers WHERE user_id = $1", [req.user.id]
    );
    if (teacher.rows.length === 0)
      return res.status(404).json({ message: "Teacher not found" });

    const result = await pool.query(
      "SELECT * FROM classes WHERE teacher_id = $1 ORDER BY class_name, section",
      [teacher.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getClasses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Teacher: GET /api/teacher/students ───────────────────────────────────────

const getStudents = async (req, res) => {
  try {
    const teacher = await pool.query(
      "SELECT id FROM teachers WHERE user_id = $1", [req.user.id]
    );
    if (teacher.rows.length === 0)
      return res.status(404).json({ message: "Teacher not found" });

    const classes = await pool.query(
      "SELECT class_name, section FROM classes WHERE teacher_id = $1",
      [teacher.rows[0].id]
    );
    if (classes.rows.length === 0) return res.json([]);

    const conditions = classes.rows
      .map((_, i) => `(s.class = $${i * 2 + 1} AND s.section = $${i * 2 + 2})`)
      .join(" OR ");
    const values = classes.rows.flatMap(c => [c.class_name, c.section]);

    const result = await pool.query(
      `SELECT s.*, u.name, u.email
       FROM students s
       JOIN users u ON s.user_id = u.id
       WHERE ${conditions}
       ORDER BY s.class, s.roll_number`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getStudents:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Teacher: POST /api/teacher/attendance ────────────────────────────────────
// FIXED: was vulnerable to SQL injection via string interpolation

const markAttendance = async (req, res) => {
  const { attendance } = req.body;
  if (!Array.isArray(attendance) || attendance.length === 0)
    return res.status(400).json({ message: "attendance array required" });

  try {
    // Build parameterized query safely
    const placeholders = attendance
      .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
      .join(", ");
    const values = attendance.flatMap(a => [a.student_id, a.date, a.status, req.user.id]);

    await pool.query(
      `INSERT INTO attendance (student_id, date, status, marked_by)
       VALUES ${placeholders}
       ON CONFLICT (student_id, date)
       DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by`,
      values
    );
    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("markAttendance:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Teacher: POST /api/teacher/assignments ───────────────────────────────────

const createAssignment = async (req, res) => {
  const { class_id, title, description, due_date } = req.body;
  if (!class_id || !title)
    return res.status(400).json({ message: "class_id and title are required" });

  try {
    const teacher = await pool.query(
      "SELECT id FROM teachers WHERE user_id = $1", [req.user.id]
    );
    if (teacher.rows.length === 0)
      return res.status(404).json({ message: "Teacher not found" });

    const result = await pool.query(
      `INSERT INTO assignments (teacher_id, class_id, title, description, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [teacher.rows[0].id, class_id, title, description, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createAssignment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Teacher: POST /api/teacher/results ───────────────────────────────────────

const addResult = async (req, res) => {
  const { student_id, subject, marks_obtained, total_marks, exam_type, exam_date } = req.body;
  if (!student_id || !subject || marks_obtained == null || !total_marks)
    return res.status(400).json({ message: "student_id, subject, marks_obtained, total_marks required" });

  try {
    const result = await pool.query(
      `INSERT INTO results (student_id, subject, marks_obtained, total_marks, exam_type, exam_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [student_id, subject, marks_obtained, total_marks, exam_type, exam_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("addResult:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherMeta,
  getProfile,
  getClasses,
  getStudents,
  markAttendance,
  createAssignment,
  addResult,
};