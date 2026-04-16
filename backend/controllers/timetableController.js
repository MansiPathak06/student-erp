const pool = require("../config/db");

// ── GET /api/admin/timetable?class_id=5
const getTimetable = async (req, res) => {
  const { class_id } = req.query;
  if (!class_id) return res.status(400).json({ message: "class_id is required" });

  try {
    const result = await pool.query(
      `SELECT
         tt.id,
         tt.class_id,
         tt.teacher_id,
         tt.subject,
         tt.day_of_week,
         u.name        AS teacher_name,
         t.employee_id AS teacher_code,
         t.profile_picture
       FROM timetable tt
       JOIN teachers t ON tt.teacher_id = t.id
       JOIN users    u ON t.user_id     = u.id
       WHERE tt.class_id = $1
       ORDER BY tt.day_of_week`,
      [class_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getTimetable:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/admin/timetable
const createPeriod = async (req, res) => {
  const { class_id, teacher_id, subject, day_of_week } = req.body;

  if (!class_id || !teacher_id || !subject || !day_of_week)
    return res.status(400).json({ message: "class_id, teacher_id, subject, day_of_week are required" });

  try {
    const result = await pool.query(
      `INSERT INTO timetable (class_id, teacher_id, subject, day_of_week)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [class_id, teacher_id, subject, day_of_week]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      if (err.constraint?.includes("teacher"))
        return res.status(409).json({ message: "This teacher already has a class on this day." });
      return res.status(409).json({ message: "This class already has a period on this day." });
    }
    console.error("createPeriod:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/admin/timetable/:id
const updatePeriod = async (req, res) => {
  const { id } = req.params;
  const { teacher_id, subject, day_of_week } = req.body;

  try {
    const result = await pool.query(
      `UPDATE timetable
       SET teacher_id  = COALESCE($1, teacher_id),
           subject     = COALESCE($2, subject),
           day_of_week = COALESCE($3, day_of_week),
           updated_at  = NOW()
       WHERE id = $4
       RETURNING *`,
      [teacher_id || null, subject || null, day_of_week || null, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Period not found" });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      if (err.constraint?.includes("teacher"))
        return res.status(409).json({ message: "This teacher already has a class on this day." });
      return res.status(409).json({ message: "This class already has a period on this day." });
    }
    console.error("updatePeriod:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE /api/admin/timetable/:id
const deletePeriod = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM timetable WHERE id = $1 RETURNING id", [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Period not found" });
    res.json({ message: "Period deleted" });
  } catch (err) {
    console.error("deletePeriod:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getTimetable, createPeriod, updatePeriod, deletePeriod };