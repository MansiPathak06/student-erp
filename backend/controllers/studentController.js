const pool = require("../config/db");

// GET /api/student/profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.name, u.email FROM students s JOIN users u ON s.user_id = u.id WHERE s.user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Profile not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/student/attendance
const getAttendance = async (req, res) => {
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (student.rows.length === 0) return res.status(404).json({ message: "Student not found" });

    const result = await pool.query(
      "SELECT * FROM attendance WHERE student_id=$1 ORDER BY date DESC LIMIT 60",
      [student.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/student/results
const getResults = async (req, res) => {
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (student.rows.length === 0) return res.status(404).json({ message: "Student not found" });

    const result = await pool.query(
      "SELECT * FROM results WHERE student_id=$1 ORDER BY exam_date DESC",
      [student.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/student/fees
const getFees = async (req, res) => {
  try {
    const student = await pool.query("SELECT id FROM students WHERE user_id=$1", [req.user.id]);
    if (student.rows.length === 0) return res.status(404).json({ message: "Student not found" });

    const result = await pool.query(
      "SELECT * FROM fees WHERE student_id=$1 ORDER BY due_date DESC",
      [student.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/student/assignments
const getAssignments = async (req, res) => {
  try {
    const student = await pool.query("SELECT class, section FROM students WHERE user_id=$1", [req.user.id]);
    if (student.rows.length === 0) return res.status(404).json({ message: "Student not found" });

    const { class: cls, section } = student.rows[0];
    const result = await pool.query(
      `SELECT a.*, u.name as teacher_name FROM assignments a
       JOIN classes c ON a.class_id = c.id
       JOIN teachers t ON a.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE c.class_name=$1 AND c.section=$2
       ORDER BY a.due_date DESC`,
      [cls, section]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/student/timetable
const getTimetable = async (req, res) => {
  try {
    const student = await pool.query(
      "SELECT class, section FROM students WHERE user_id=$1",
      [req.user.id]
    );
    if (student.rows.length === 0)
      return res.status(404).json({ message: "Student not found" });

    const { class: cls, section } = student.rows[0];

    const result = await pool.query(
      `SELECT tt.*, u.name as teacher_name, c.class_name, c.section
       FROM timetable tt
       JOIN classes c ON tt.class_id = c.id
       JOIN teachers t ON tt.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE (c.class_name = $1 AND c.section = $2)
          OR (c.class_name = $3)          
       ORDER BY CASE tt.day_of_week
         WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2
         WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4
         WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
       END, tt.start_time`,
      [cls, section, `${cls}-${section}`] // handles both "11","C" and "11-C" formats
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getTimetable error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/student/teachers
// GET /api/student/teachers
const getTeachers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, u.name, u.email, t.subject, t.phone
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       ORDER BY u.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getTeachers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ↓ Update this line at the bottom
module.exports = { getProfile, getAttendance, getResults, getFees, getAssignments, getTimetable, getTeachers };

