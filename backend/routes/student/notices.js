const express = require("express");
const router  = express.Router();
const pool    = require("../../config/db");
const { protect, authorizeRoles } = require("../../middleware/authMiddleware");

router.use(protect, authorizeRoles("student"));

// GET /api/student/notices
router.get("/", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT n.*, u.name AS author,
              EXISTS(
                SELECT 1 FROM notice_reads nr
                WHERE nr.notice_id = n.id AND nr.user_id = $1
              ) AS is_read
       FROM notices n
       LEFT JOIN users u ON u.id = n.created_by
       WHERE n.audience ILIKE '%student%' OR n.audience ILIKE '%all%'
       ORDER BY n.is_pinned DESC, n.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Student notices error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/student/notices/unread-count
router.get("/unread-count", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM notices n
       WHERE (n.audience ILIKE '%student%' OR n.audience ILIKE '%all%')
         AND NOT EXISTS (
           SELECT 1 FROM notice_reads nr
           WHERE nr.notice_id = n.id AND nr.user_id = $1
         )`,
      [req.user.id]
    );
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    console.error("Student notices unread-count error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/student/notices/:id/read
router.post("/:id/read", async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO notice_reads (notice_id, user_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Student notices read error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/student/notices/mark-all-read
router.post("/mark-all-read", async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO notice_reads (notice_id, user_id)
       SELECT n.id, $1 FROM notices n
       WHERE (n.audience ILIKE '%student%' OR n.audience ILIKE '%all%')
       ON CONFLICT DO NOTHING`,
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Student notices mark-all-read error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;