const pool = require("../config/db");
const bcrypt = require("bcryptjs");

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [students, teachers, classes, revenue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM students"),
      pool.query("SELECT COUNT(*) FROM teachers"),
      pool.query("SELECT COUNT(*) FROM classes"),
      pool.query("SELECT COALESCE(SUM(amount),0) as total FROM fees WHERE status = 'Paid' AND EXTRACT(MONTH FROM paid_date) = EXTRACT(MONTH FROM NOW())"),
    ]);

    const attendanceResult = await pool.query(`
      SELECT 
        ROUND(100.0 * SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) as rate
      FROM attendance
      WHERE date >= NOW() - INTERVAL '30 days'
    `);

    res.json({
      totalStudents: parseInt(students.rows[0].count),
      totalTeachers: parseInt(teachers.rows[0].count),
      totalClasses: parseInt(classes.rows[0].count),
      monthlyRevenue: parseFloat(revenue.rows[0].total),
      attendanceRate: parseFloat(attendanceResult.rows[0].rate) || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/students
const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.name, u.email, u.is_active
      FROM students s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/students
const createStudent = async (req, res) => {
  const { name, email, password, roll_number, class: cls, section, phone, address, date_of_birth, gender, guardian_name, guardian_phone } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'student') RETURNING id",
      [name, email, hashed]
    );
    const userId = userRes.rows[0].id;
    const studentRes = await pool.query(
      `INSERT INTO students (user_id, roll_number, class, section, phone, address, date_of_birth, gender, guardian_name, guardian_phone)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [userId, roll_number, cls, section, phone, address, date_of_birth, gender, guardian_name, guardian_phone]
    );
    res.status(201).json({ message: "Student created", student: studentRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/students/:id
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { class: cls, section, phone, address, fee_status, guardian_name, guardian_phone } = req.body;
  try {
    const result = await pool.query(
      `UPDATE students SET class=$1, section=$2, phone=$3, address=$4, fee_status=$5, guardian_name=$6, guardian_phone=$7
       WHERE id=$8 RETURNING *`,
      [cls, section, phone, address, fee_status, guardian_name, guardian_phone, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/students/:id
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await pool.query("SELECT user_id FROM students WHERE id=$1", [id]);
    if (student.rows.length === 0) return res.status(404).json({ message: "Student not found" });
    await pool.query("DELETE FROM users WHERE id=$1", [student.rows[0].user_id]);
    res.json({ message: "Student deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { getDashboard, getAllStudents, createStudent, updateStudent, deleteStudent };