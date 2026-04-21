// controllers/admin/noticesController.js

const pool = require("../../config/db");

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

// Allowed audience values
const VALID_AUDIENCES = ["All Students", "All Teachers", "All Students,All Teachers"];

function isValidAudience(audience) {
  if (!audience) return false;
  // Accept any combination of the two valid parts
  const parts = audience.split(",").map(s => s.trim()).filter(Boolean);
  const allowed = ["All Students", "All Teachers"];
  return parts.length > 0 && parts.every(p => allowed.includes(p));
}


// ─────────────────────────────────────────────
// GET ALL NOTICES  (admin sees all)
// GET /api/admin/notices
// ─────────────────────────────────────────────
const getAllNotices = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        n.*,
        u.name AS author_name
      FROM notices n
      LEFT JOIN users u ON n.created_by = u.id
      ORDER BY n.is_pinned DESC, n.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("getAllNotices error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ─────────────────────────────────────────────
// CREATE NOTICE
// POST /api/admin/notices
// ─────────────────────────────────────────────
const createNotice = async (req, res) => {
  const { title, content, category, priority, audience, is_pinned } = req.body;

  if (!title?.trim())   return res.status(400).json({ message: "Title is required" });
  if (!content?.trim()) return res.status(400).json({ message: "Content is required" });
  if (!isValidAudience(audience))
    return res.status(400).json({ message: "Invalid audience. Use 'All Students', 'All Teachers', or both." });

  // Normalize audience: sort parts consistently
  const normalizedAudience = audience
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .sort()           // consistent order in DB
    .join(",");

  try {
    const result = await pool.query(`
      INSERT INTO notices (title, content, category, priority, audience, is_pinned, author, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      title.trim(),
      content.trim(),
      category  || "General",
      priority  || "Normal",
      normalizedAudience,
      is_pinned ?? false,
      req.user?.name || "Admin",
      req.user?.id   || null,
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createNotice error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ─────────────────────────────────────────────
// UPDATE NOTICE
// PUT /api/admin/notices/:id
// ─────────────────────────────────────────────
const updateNotice = async (req, res) => {
  const { id } = req.params;
  const { title, content, category, priority, audience, is_pinned } = req.body;

  if (!title?.trim())   return res.status(400).json({ message: "Title is required" });
  if (!content?.trim()) return res.status(400).json({ message: "Content is required" });
  if (!isValidAudience(audience))
    return res.status(400).json({ message: "Invalid audience value" });

  const normalizedAudience = audience
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .sort()
    .join(",");

  try {
    const result = await pool.query(`
      UPDATE notices
      SET title      = $1,
          content    = $2,
          category   = $3,
          priority   = $4,
          audience   = $5,
          is_pinned  = $6,
          updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `, [
      title.trim(),
      content.trim(),
      category || "General",
      priority || "Normal",
      normalizedAudience,
      is_pinned ?? false,
      id,
    ]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Notice not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("updateNotice error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ─────────────────────────────────────────────
// DELETE NOTICE
// DELETE /api/admin/notices/:id
// ─────────────────────────────────────────────
const deleteNotice = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM notices WHERE id = $1 RETURNING id",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Notice not found" });

    res.json({ message: "Notice deleted", id: result.rows[0].id });
  } catch (err) {
    console.error("deleteNotice error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { getAllNotices, createNotice, updateNotice, deleteNotice };