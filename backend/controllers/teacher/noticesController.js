// controllers/teacher/noticesController.js

const pool = require("../../config/db");

// ─────────────────────────────────────────────
// GET NOTICES FOR TEACHER
// GET /api/teacher/notices
//
// Returns notices where audience contains "All Teachers"
// ─────────────────────────────────────────────
const getTeacherNotices = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        content,
        category,
        priority,
        audience,
        is_pinned,
        author,
        created_at,
        updated_at
      FROM notices
      WHERE audience LIKE '%All Teachers%'
      ORDER BY is_pinned DESC, created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("getTeacherNotices error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getTeacherNotices };