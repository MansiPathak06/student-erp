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
// const getAllStudents = async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT s.*, u.name, u.email, u.is_active
//       FROM students s
//       JOIN users u ON s.user_id = u.id
//       ORDER BY s.created_at DESC
//     `);
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// POST /api/admin/students
// const createStudent = async (req, res) => {
//   const { name, email, password, roll_number, class: cls, section, phone, address, date_of_birth, gender, guardian_name, guardian_phone } = req.body;
//   try {
//     const hashed = await bcrypt.hash(password, 10);
//     const userRes = await pool.query(
//       "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,'student') RETURNING id",
//       [name, email, hashed]
//     );
//     const userId = userRes.rows[0].id;
//     const studentRes = await pool.query(
//       `INSERT INTO students (user_id, roll_number, class, section, phone, address, date_of_birth, gender, guardian_name, guardian_phone)
//        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
//       [userId, roll_number, cls, section, phone, address, date_of_birth, gender, guardian_name, guardian_phone]
//     );
//     res.status(201).json({ message: "Student created", student: studentRes.rows[0] });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// PUT /api/admin/students/:id
// const updateStudent = async (req, res) => {
//   const { id } = req.params;
//   const { class: cls, section, phone, address, fee_status, guardian_name, guardian_phone } = req.body;
//   try {
//     const result = await pool.query(
//       `UPDATE students SET class=$1, section=$2, phone=$3, address=$4, fee_status=$5, guardian_name=$6, guardian_phone=$7
//        WHERE id=$8 RETURNING *`,
//       [cls, section, phone, address, fee_status, guardian_name, guardian_phone, id]
//     );
//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// DELETE /api/admin/students/:id
// const deleteStudent = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const student = await pool.query("SELECT user_id FROM students WHERE id=$1", [id]);
//     if (student.rows.length === 0) return res.status(404).json({ message: "Student not found" });
//     await pool.query("DELETE FROM users WHERE id=$1", [student.rows[0].user_id]);
//     res.json({ message: "Student deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

async function generateStudentId() {
  const year = new Date().getFullYear();
  const prefix = `STU-${year}-`;
 
  const result = await pool.query(
    `SELECT student_id FROM students
     WHERE student_id LIKE $1
     ORDER BY student_id DESC
     LIMIT 1`,
    [`${prefix}%`]
  );
 
  let seq = 1;
  if (result.rows.length > 0) {
    const last = result.rows[0].student_id; // e.g. "STU-2024-0042"
    const parts = last.split("-");
    seq = parseInt(parts[parts.length - 1], 10) + 1;
  }
 
  return `${prefix}${String(seq).padStart(4, "0")}`;
}
 
 
// ── GET /api/admin/students/meta ──────────────────────────────────────────────
// Returns all classes with their assigned teacher name — used to populate the
// "Add Student" dropdown so section + class teacher auto-fill on selection.
// const getStudentMeta = async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT
//          c.id,
//          c.class_name,
//          c.section,
//          c.room_no,
//          u.name  AS teacher_name,
//          t.id    AS teacher_id
//        FROM classes c
//        LEFT JOIN teachers t ON c.teacher_id = t.id
//        LEFT JOIN users    u ON t.user_id    = u.id
//        ORDER BY c.class_name, c.section`
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error("getStudentMeta error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
 
 
// ── GET /api/admin/students ───────────────────────────────────────────────────
// ── GET /api/admin/students ───────────────────────────────────────────────────
const getAllStudents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         s.*,
         u.name,
         u.email,
         u.is_active,
         ct.name AS class_teacher,
         (
           SELECT ROUND(
             COUNT(*) FILTER (WHERE a.status = 'Present') * 100.0
             / NULLIF(COUNT(*), 0)
           )
           FROM attendance a
           WHERE a.student_id = s.id
         ) AS attendance_pct
       FROM students s
       JOIN users    u  ON s.user_id    = u.id
       LEFT JOIN classes c   ON s.class_id  = c.id
       LEFT JOIN teachers t  ON c.teacher_id = t.id
       LEFT JOIN users   ct  ON t.user_id    = ct.id
       ORDER BY s.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getAllStudents error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
 
 
// ── POST /api/admin/students ──────────────────────────────────────────────────
// ── POST /api/admin/students ──────────────────────────────────────────────────
const createStudent = async (req, res) => {
  const {
    student_id,          // optional — auto-generated if blank
    name,
    email,
    password,
    roll_number,
    class_id,
    class: className,
    section,
    class_teacher,
    date_of_birth,
    gender,
    address,
    phone,
    guardian_name,
    guardian_phone,
  } = req.body;
 
  if (!name || !email || !password || !roll_number || !class_id) {
    return res.status(400).json({
      message: "name, email, password, roll_number, and class_id are required",
    });
  }
 
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
 
    // 1. Create auth user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (name, email, password, role, is_active)
       VALUES ($1, $2, $3, 'student', true)
       RETURNING id`,
      [name, email, hashedPassword]
    );
    const userId = userResult.rows[0].id;
 
    // 2. Generate or use provided student ID
    const finalStudentId = student_id?.trim() || (await generateStudentId());
 
    // 3. Create student record - REMOVED is_active from here
    const studentResult = await client.query(
      `INSERT INTO students
         (user_id, student_id, roll_number, class_id, class, section,
          class_teacher, date_of_birth, gender, address, phone,
          guardian_name, guardian_phone, fee_status)
       VALUES
         ($1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, 'Pending')
       RETURNING *`,
      [
        userId,
        finalStudentId,
        roll_number,
        class_id,
        className,
        section,
        class_teacher,
        date_of_birth || null,
        gender,
        address,
        phone,
        guardian_name,
        guardian_phone,
      ]
    );
 
    await client.query("COMMIT");
 
    res.status(201).json({
      ...studentResult.rows[0],
      name,
      email,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createStudent error:", err);
 
    if (err.code === "23505") {
      // Unique constraint — could be email or student_id
      if (err.constraint?.includes("email")) {
        return res.status(409).json({ message: "A user with this email already exists." });
      }
      if (err.constraint?.includes("student_id")) {
        return res.status(409).json({ message: "This Student ID is already taken." });
      }
      return res.status(409).json({ message: "Duplicate entry — please check email or Student ID." });
    }
 
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};
 
 
// ── PUT /api/admin/students/:id ───────────────────────────────────────────────
// ── PUT /api/admin/students/:id ───────────────────────────────────────────────
const updateStudent = async (req, res) => {
  const { id } = req.params;
  const {
    class_id,
    class: className,
    section,
    class_teacher,
    phone,
    address,
    fee_status,
    guardian_name,
    guardian_phone,
  } = req.body;
 
  try {
    const result = await pool.query(
      `UPDATE students SET
         class_id       = COALESCE($1, class_id),
         class          = COALESCE($2, class),
         section        = COALESCE($3, section),
         class_teacher  = COALESCE($4, class_teacher),
         phone          = COALESCE($5, phone),
         address        = COALESCE($6, address),
         fee_status     = COALESCE($7, fee_status),
         guardian_name  = COALESCE($8, guardian_name),
         guardian_phone = COALESCE($9, guardian_phone),
         updated_at     = NOW()
       WHERE id = $10
       RETURNING *`,
      [class_id, className, section, class_teacher, phone, address, fee_status, guardian_name, guardian_phone, id]
    );
 
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }
 
    res.json(result.rows[0]);
  } catch (err) {
    console.error("updateStudent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
 
// ── DELETE /api/admin/students/:id ───────────────────────────────────────────
const deleteStudent = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
 
    // Get the user_id before deleting the student
    const studentRow = await client.query(
      "SELECT user_id FROM students WHERE id = $1",
      [id]
    );
    if (studentRow.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Student not found" });
    }
    const userId = studentRow.rows[0].user_id;
 
    // Delete student first (FK constraint), then user
    await client.query("DELETE FROM students WHERE id = $1", [id]);
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
 
    await client.query("COMMIT");
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("deleteStudent error:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};
// adminStudentController.js (add this function)
const getStudentMeta = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.class_name,
        c.section,
        u.name AS teacher_name
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      ORDER BY c.class_name, c.section
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("getStudentMeta error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// In your admin student controller — update student to save photo_url
const uploadStudentPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const photoUrl = `/uploads/students/${req.file.filename}`;
    await pool.query(
      "UPDATE students SET photo_url = $1 WHERE id = $2",
      [photoUrl, id]
    );
    res.json({ photo_url: photoUrl });
  } catch (err) {
    console.error("uploadStudentPhoto error:", err); // ← add this
    res.status(500).json({ message: err.message });  
   
  }
};
 


module.exports = { getDashboard, getAllStudents, createStudent, updateStudent, deleteStudent,  getStudentMeta,  uploadStudentPhoto };