const pool = require("../config/db");

// GET /api/admin/classes
const getAllClasses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.id          AS id,
        c.class_name  AS class_name,
        c.section     AS section,
        c.grade       AS grade,
        c.teacher_id  AS teacher_id,
        u.name        AS teacher_name
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users   u ON t.user_id     = u.id
      ORDER BY c.created_at DESC
    `);

    console.log("Sample row from DB:", result.rows[0]); // ← remove after confirming

    const classes = result.rows.map((c) => ({
      id:           `CLS-${String(c.id).padStart(3, "0")}`,
      dbId:         c.id,
      grade:        c.grade       || c.class_name || "—",
      section:      c.section     || "—",
      classTeacher: c.teacher_name || "Unassigned",
      teacherId:    c.teacher_id,
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
    const [teachers, grades] = await Promise.all([
      pool.query(`
        SELECT t.id, u.name
        FROM teachers t
        JOIN users u ON t.user_id = u.id
        ORDER BY u.name
      `),
      pool.query(`
        SELECT DISTINCT COALESCE(grade, class_name) AS grade
        FROM classes
        WHERE COALESCE(grade, class_name) IS NOT NULL
        ORDER BY grade
      `),
    ]);

    res.json({
      teachers: teachers.rows,
      grades:   grades.rows.map((r) => r.grade),
    });
  } catch (err) {
    console.error("getClassMeta:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/admin/classes
const createClass = async (req, res) => {
  const { class_name, section, grade, teacher_id } = req.body;

  if (!grade || !section) {
    return res.status(400).json({ message: "Grade and section are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO classes (class_name, section, grade, teacher_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [class_name || grade, section, grade, teacher_id || null]
    );
    res.status(201).json({ message: "Class created", class: result.rows[0] });
  } catch (err) {
    console.error("createClass:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/classes/:id
const updateClass = async (req, res) => {
  const { id } = req.params;
  const { class_name, section, grade, teacher_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE classes
       SET class_name = $1,
           section    = $2,
           grade      = $3,
           teacher_id = $4
       WHERE id = $5
       RETURNING *`,
      [class_name || grade, section, grade, teacher_id || null, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Class not found" });

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
    const result = await pool.query(
      "DELETE FROM classes WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Class not found" });
    res.json({ message: "Class deleted" });
  } catch (err) {
    console.error("deleteClass:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllClasses, getClassMeta, createClass, updateClass, deleteClass };