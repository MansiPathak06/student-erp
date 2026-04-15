const pool = require("../config/db");

// GET /api/admin/classes
const getAllClasses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id,
        c.class_name,
        c.section,
        c.grade,
        c.subject,
        c.room,
        c.schedule,
        c.capacity,
        c.status,
        c.attendance,
        c.teacher_id,
        u.name AS teacher_name,
        COUNT(s.id)::int AS student_count
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN students s ON s.class = c.class_name AND s.section = c.section
      GROUP BY c.id, u.name
      ORDER BY c.created_at DESC
    `);

    const classes = result.rows.map(c => ({
      id:           `CLS-${String(c.id).padStart(3, "0")}`,
      dbId:         c.id,
      name:         `${c.class_name}-${c.section}`,
      grade:        c.grade || `Grade ${c.class_name}`,
      classTeacher: c.teacher_name || "Unassigned",
      teacherId:    c.teacher_id,
      subject:      c.subject || "—",
      room:         c.room || "—",
      schedule:     c.schedule || "—",
      capacity:     c.capacity || 40,
      students:     c.student_count || 0,
      attendance:   c.attendance || 0,
      status:       c.status || "Active",
    }));

    res.json(classes);
  } catch (err) {
    console.error("getAllClasses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/classes/meta
const getClassMeta = async (req, res) => {
  try {
    const teachers = await pool.query(`
      SELECT t.id, u.name
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY u.name
    `);
    const grades = await pool.query(`
      SELECT DISTINCT grade FROM classes WHERE grade IS NOT NULL ORDER BY grade
    `);
    res.json({
      teachers:  teachers.rows,
      grades:    grades.rows.map(r => r.grade),
    });
  } catch (err) {
    console.error("getClassMeta:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/classes
const createClass = async (req, res) => {
  const { class_name, section, grade, subject, teacher_id, room, schedule, capacity, status } = req.body;
  if (!class_name || !section) {
    return res.status(400).json({ message: "class_name and section are required" });
  }
  try {
    const result = await pool.query(`
      INSERT INTO classes (class_name, section, grade, subject, teacher_id, room, schedule, capacity, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `, [class_name, section, grade, subject, teacher_id || null, room, schedule, capacity || 40, status || "Active"]);

    res.status(201).json({ message: "Class created", class: result.rows[0] });
  } catch (err) {
    console.error("createClass:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/classes/:id
const updateClass = async (req, res) => {
  const { id } = req.params;
  const { class_name, section, grade, subject, teacher_id, room, schedule, capacity, status } = req.body;
  try {
    const result = await pool.query(`
      UPDATE classes
      SET class_name=$1, section=$2, grade=$3, subject=$4,
          teacher_id=$5, room=$6, schedule=$7, capacity=$8, status=$9
      WHERE id=$10 RETURNING *
    `, [class_name, section, grade, subject, teacher_id || null, room, schedule, capacity, status, id]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Class not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("updateClass:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/classes/:id
const deleteClass = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM classes WHERE id=$1 RETURNING id", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Class not found" });
    res.json({ message: "Class deleted" });
  } catch (err) {
    console.error("deleteClass:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllClasses, getClassMeta, createClass, updateClass, deleteClass };