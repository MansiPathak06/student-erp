// controllers/attendanceController.js
const pool = require("../config/db");

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: today's date in YYYY-MM-DD
// ─────────────────────────────────────────────────────────────────────────────
const todayStr = () => new Date().toISOString().split("T")[0];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/attendance/status
// Query: ?class_id=&date=YYYY-MM-DD (date optional → defaults to today)
// Used by teacher page on load to decide which UI to show
// ─────────────────────────────────────────────────────────────────────────────
exports.getStatus = async (req, res) => {
  try {
    const { class_id, date = todayStr() } = req.query;

    if (!class_id)
      return res.status(400).json({ message: "class_id is required" });

    // 1. Holiday check
    const { rows: holidays } = await pool.query(
      `SELECT title FROM holidays WHERE date = $1`,
      [date]
    );
    if (holidays.length > 0) {
      return res.json({
        isHoliday:     true,
        alreadyMarked: false,
        holidayTitle:  holidays[0].title,
        message:       `Today is a holiday: ${holidays[0].title}`,
        date,
      });
    }

    // 2. Already marked check
    const { rows: existing } = await pool.query(
      `SELECT COUNT(*) AS cnt
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       WHERE a.class_id = $1 AND a.date = $2`,
      [class_id, date]
    );
    const alreadyMarked = parseInt(existing[0].cnt) > 0;

    // 3. Total students in class
    const { rows: stuRows } = await pool.query(
      `SELECT COUNT(*) AS cnt FROM students WHERE class_id = $1 AND is_active = true`,
      [class_id]
    );

    return res.json({
      isHoliday:     false,
      alreadyMarked,
      markedCount:   parseInt(existing[0].cnt),
      totalStudents: parseInt(stuRows[0].cnt),
      date,
      message: alreadyMarked
        ? "Attendance already marked for today."
        : "Attendance not yet marked.",
    });
  } catch (err) {
    console.error("getStatus:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/attendance/mark
// Body: { class_id, date, records: [{ student_id, status, note? }] }
// ─────────────────────────────────────────────────────────────────────────────
exports.markAttendance = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { class_id, date = todayStr(), records } = req.body;

    // ── Validate input ────────────────────────────────────────────────────
    if (!class_id)
      throw { status: 400, message: "class_id is required." };
    if (!Array.isArray(records) || records.length === 0)
      throw { status: 400, message: "records array is required." };

    // ── Holiday check ─────────────────────────────────────────────────────
    const { rows: holidays } = await client.query(
      `SELECT title FROM holidays WHERE date = $1`,
      [date]
    );
    if (holidays.length > 0)
      throw {
        status: 400,
        message: `Cannot mark attendance. ${date} is a holiday: ${holidays[0].title}`,
      };

    // ── Duplicate check ───────────────────────────────────────────────────
    const { rows: existing } = await client.query(
      `SELECT COUNT(*) AS cnt
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       WHERE a.class_id = $1 AND a.date = $2`,
      [class_id, date]
    );
    if (parseInt(existing[0].cnt) > 0)
      throw {
        status: 409,
        message: `Attendance for ${date} is already marked. Use edit to update.`,
      };

    // ── Insert all records ────────────────────────────────────────────────
    const validStatuses = ["Present", "Absent", "Leave"];
    for (const rec of records) {
      if (!rec.student_id)
        throw { status: 400, message: "Each record must have student_id." };
      if (!validStatuses.includes(rec.status))
        throw { status: 400, message: `Invalid status: ${rec.status}. Use Present, Absent, or Leave.` };

      await client.query(
        `INSERT INTO attendance (student_id, class_id, date, status, marked_by, note)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [rec.student_id, class_id, date, rec.status, req.user.id, rec.note || null]
      );
    }

    await client.query("COMMIT");

    const present = records.filter(r => r.status === "Present").length;
    const absent  = records.filter(r => r.status === "Absent").length;
    const leave   = records.filter(r => r.status === "Leave").length;

    res.status(201).json({
      message:  "Attendance marked successfully.",
      date,
      class_id,
      summary:  { total: records.length, present, absent, leave },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("markAttendance:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/attendance/records
// Query: ?class_id=&date=
// Returns attendance records with student info for a class on a date
// ─────────────────────────────────────────────────────────────────────────────
exports.getRecords = async (req, res) => {
  try {
    const { class_id, date = todayStr() } = req.query;
    if (!class_id) return res.status(400).json({ message: "class_id is required" });

    const { rows } = await pool.query(
      `SELECT
         a.id, a.student_id, a.date, a.status, a.note,
         s.roll_number, u.name, u.email,
         s.gender, s.photo_url
       FROM attendance a
       JOIN students s ON s.id = a.student_id
       JOIN users    u ON u.id = s.user_id
       WHERE a.class_id = $1 AND a.date = $2
       ORDER BY s.roll_number, u.name`,
      [class_id, date]
    );

    res.json(rows);
  } catch (err) {
    console.error("getRecords:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/attendance/update
// Body: { class_id, date, records: [{ student_id, status, note? }] }
// Allow editing already-marked attendance
// ─────────────────────────────────────────────────────────────────────────────
exports.updateAttendance = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { class_id, date = todayStr(), records } = req.body;

    if (!class_id || !Array.isArray(records) || !records.length)
      throw { status: 400, message: "class_id and records are required." };

    // Holiday check
    const { rows: holidays } = await client.query(
      `SELECT title FROM holidays WHERE date = $1`, [date]
    );
    if (holidays.length > 0)
      throw { status: 400, message: `${date} is a holiday: ${holidays[0].title}` };

    const validStatuses = ["Present", "Absent", "Leave"];
    for (const rec of records) {
      if (!validStatuses.includes(rec.status))
        throw { status: 400, message: `Invalid status: ${rec.status}` };

      await client.query(
        `UPDATE attendance SET status = $1, note = $2, marked_by = $3, updated_at = NOW()
         WHERE student_id = $4 AND date = $5 AND class_id = $6`,
        [rec.status, rec.note || null, req.user.id, rec.student_id, date, class_id]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Attendance updated successfully." });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.status) return res.status(err.status).json({ message: err.message });
    console.error("updateAttendance:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: GET /api/admin/attendance/report
// Query: ?class_id=&start_date=&end_date=
// ─────────────────────────────────────────────────────────────────────────────
exports.getReport = async (req, res) => {
  try {
    const {
      class_id,
      start_date = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
      end_date   = todayStr(),
    } = req.query;

    if (!class_id) return res.status(400).json({ message: "class_id is required" });

    const { rows } = await pool.query(
      `SELECT
         s.id AS student_id,
         u.name,
         s.roll_number,
         COUNT(*)                                          FILTER (WHERE a.status = 'Present') AS present,
         COUNT(*)                                          FILTER (WHERE a.status = 'Absent')  AS absent,
         COUNT(*)                                          FILTER (WHERE a.status = 'Leave')   AS leave,
         COUNT(*)                                                                               AS total,
         ROUND(
           COUNT(*) FILTER (WHERE a.status = 'Present') * 100.0
           / NULLIF(COUNT(*), 0), 1
         )                                                                                     AS percent
       FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN attendance a ON a.student_id = s.id
         AND a.date BETWEEN $2 AND $3
         AND a.class_id = $1
       WHERE s.class_id = $1 AND s.is_active = true
       GROUP BY s.id, u.name, s.roll_number
       ORDER BY s.roll_number, u.name`,
      [class_id, start_date, end_date]
    );

    res.json({ data: rows, start_date, end_date });
  } catch (err) {
    console.error("getReport:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HOLIDAYS CRUD (admin only)
// ─────────────────────────────────────────────────────────────────────────────

exports.getHolidays = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query;
    const { rows } = await pool.query(
      `SELECT * FROM holidays
       WHERE EXTRACT(YEAR FROM date) = $1
       ORDER BY date`,
      [year]
    );
    res.json(rows);
  } catch (err) {
    console.error("getHolidays:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createHoliday = async (req, res) => {
  try {
    const { date, title, description } = req.body;
    if (!date || !title?.trim())
      return res.status(400).json({ message: "date and title are required." });

    const { rows } = await pool.query(
      `INSERT INTO holidays (date, title, description, created_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (date) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description
       RETURNING *`,
      [date, title.trim(), description || null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("createHoliday:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteHoliday = async (req, res) => {
  try {
    await pool.query(`DELETE FROM holidays WHERE id = $1`, [req.params.id]);
    res.json({ message: "Holiday deleted." });
  } catch (err) {
    console.error("deleteHoliday:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// GET /api/student/attendance?month=4&year=2026
exports.getStudentAttendance = async (req, res) => {
  try {
    const studentRow = await pool.query(
      `SELECT id, class_id FROM students WHERE user_id = $1`, [req.user.id]
    );
    if (!studentRow.rows.length)
      return res.status(404).json({ message: "Student not found" });

    const { id: student_id, class_id } = studentRow.rows[0];
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const start = `${year}-${String(month).padStart(2,"0")}-01`;
    const end   = new Date(year, month, 0).toISOString().split("T")[0];

    // Attendance records
    const { rows: attendance } = await pool.query(
      `SELECT date, status, note FROM attendance
       WHERE student_id = $1 AND date BETWEEN $2 AND $3
       ORDER BY date`,
      [student_id, start, end]
    );

    // Holidays
    const { rows: holidays } = await pool.query(
      `SELECT date, title FROM holidays
       WHERE date BETWEEN $1 AND $2 ORDER BY date`,
      [start, end]
    );

    // Monthly summary
    const present  = attendance.filter(a => a.status === "Present").length;
    const absent   = attendance.filter(a => a.status === "Absent").length;
    const leave    = attendance.filter(a => a.status === "Leave").length;
    const total    = attendance.length;
    const percent  = total > 0 ? Math.round((present / total) * 100) : 0;

    res.json({ attendance, holidays, summary: { present, absent, leave, total, percent }, month, year });
  } catch (err) {
    console.error("getStudentAttendance:", err);
    res.status(500).json({ message: "Server error" });
  }
}; 