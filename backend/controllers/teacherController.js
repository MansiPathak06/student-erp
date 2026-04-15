const pool = require("../config/db");

// GET /api/teacher/profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name, u.email FROM teachers t JOIN users u ON t.user_id = u.id WHERE t.user_id=$1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/teacher/classes
const getClasses = async (req, res) => {
  try {
    const teacher = await pool.query("SELECT id FROM teachers WHERE user_id=$1", [req.user.id]);
    if (teacher.rows.length === 0) return res.status(404).json({ message: "Teacher not found" });

    const result = await pool.query(
      "SELECT * FROM classes WHERE teacher_id=$1", [teacher.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/teacher/students  (students in teacher's classes)
const getStudents = async (req, res) => {
  try {
    const teacher = await pool.query("SELECT id FROM teachers WHERE user_id=$1", [req.user.id]);
    if (teacher.rows.length === 0) return res.status(404).json({ message: "Teacher not found" });

    const classes = await pool.query("SELECT class_name, section FROM classes WHERE teacher_id=$1", [teacher.rows[0].id]);
    if (classes.rows.length === 0) return res.json([]);

    const conditions = classes.rows.map((_, i) => `(class=$${i * 2 + 1} AND section=$${i * 2 + 2})`).join(" OR ");
    const values = classes.rows.flatMap(c => [c.class_name, c.section]);

    const result = await pool.query(
      `SELECT s.*, u.name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE ${conditions} ORDER BY s.class, s.roll_number`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/teacher/attendance
const markAttendance = async (req, res) => {
  const { attendance } = req.body; // array: [{ student_id, date, status }]
  if (!Array.isArray(attendance)) return res.status(400).json({ message: "attendance array required" });

  try {
    const values = attendance.map(a => `(${a.student_id}, '${a.date}', '${a.status}', ${req.user.id})`).join(",");
    await pool.query(
      `INSERT INTO attendance (student_id, date, status, marked_by) VALUES ${values}
       ON CONFLICT (student_id, date) DO UPDATE SET status = EXCLUDED.status`
    );
    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/teacher/assignments
const createAssignment = async (req, res) => {
  const { class_id, title, description, due_date } = req.body;
  try {
    const teacher = await pool.query("SELECT id FROM teachers WHERE user_id=$1", [req.user.id]);
    if (teacher.rows.length === 0) return res.status(404).json({ message: "Teacher not found" });

    const result = await pool.query(
      "INSERT INTO assignments (teacher_id, class_id, title, description, due_date) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [teacher.rows[0].id, class_id, title, description, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/teacher/results
const addResult = async (req, res) => {
  const { student_id, subject, marks_obtained, total_marks, exam_type, exam_date } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO results (student_id, subject, marks_obtained, total_marks, exam_type, exam_date) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
      [student_id, subject, marks_obtained, total_marks, exam_type, exam_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProfile, getClasses, getStudents, markAttendance, createAssignment, addResult };