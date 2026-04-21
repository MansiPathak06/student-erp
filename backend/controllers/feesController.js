// controllers/feesController.js
const pool = require("../config/db");

// ─── Helper ───────────────────────────────────────────────────────────────────
const resolveStatus = (paid, total, dueDate) => {
  if (Number(total) <= 0) return "Pending";
  if (Number(paid) >= Number(total)) return "Paid";
  if (Number(paid) > 0) return "Partial";
  if (dueDate && new Date(dueDate) < new Date()) return "Overdue";
  return "Pending";
};

// ─────────────────────────────────────────────────────────────────────────────
// FEE STRUCTURES
// ─────────────────────────────────────────────────────────────────────────────

exports.getAllStructures = async (req, res) => {
  try {
    const { academic_year = "2024-25" } = req.query;
    const { rows } = await pool.query(
      `SELECT fs.*, u.name AS set_by_name,
              (SELECT COUNT(*) FROM student_fees sf
               WHERE sf.fee_structure_id = fs.id) AS student_count
       FROM fee_structures fs
       LEFT JOIN users u ON u.id = fs.created_by
       WHERE fs.academic_year = $1
       ORDER BY fs.class`,
      [academic_year]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("getAllStructures:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.upsertStructure = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      class: cls,
      section,
      academic_year,
      tuition_fee = 0,
      library_fee = 0,
      other_fee = 0,
      due_date,
    } = req.body;

    if (!cls || !academic_year)
      return res.status(400).json({ success: false, message: "class and academic_year are required" });

    const baseFee = Number(tuition_fee) + Number(library_fee) + Number(other_fee);

    // fee_structures mein section column NAHI hai — without section upsert
    const { rows: structRows } = await client.query(
      `INSERT INTO fee_structures
         (class, academic_year, tuition_fee, transport_fee, library_fee, other_fee, created_by)
       VALUES ($1, $2, $3, 0, $4, $5, $6)
       ON CONFLICT (class, academic_year) DO UPDATE SET
         tuition_fee = EXCLUDED.tuition_fee,
         library_fee = EXCLUDED.library_fee,
         other_fee   = EXCLUDED.other_fee,
         updated_at  = NOW()
       RETURNING *`,
      [cls, academic_year, tuition_fee, library_fee, other_fee, req.user.id]
    );

    const structure = structRows[0];

    // Students find karo class + section se (students table mein section hai)
    const studentParams = [cls];
    let studentWhere = "s.class = $1";
    if (section) {
      studentWhere += " AND s.section = $2";
      studentParams.push(section);
    }

    const { rows: students } = await client.query(
      `SELECT s.id FROM students s WHERE ${studentWhere}`,
      studentParams
    );

    let newCount = 0;
    const status = resolveStatus(0, baseFee, due_date);

    for (const student of students) {
      const { rowCount } = await client.query(
        `INSERT INTO student_fees
           (student_id, fee_structure_id, academic_year,
            tuition_fee, library_fee, other_fee, transport_fee,
            total_fees, paid_amount, due_date, status, last_updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, 0, $7, 0, $8, $9, $10)
         ON CONFLICT (student_id, academic_year) DO UPDATE SET
           fee_structure_id = EXCLUDED.fee_structure_id,
           tuition_fee      = EXCLUDED.tuition_fee,
           library_fee      = EXCLUDED.library_fee,
           other_fee        = EXCLUDED.other_fee,
           total_fees       = EXCLUDED.tuition_fee + EXCLUDED.library_fee
                            + EXCLUDED.other_fee + student_fees.transport_fee,
           due_date         = EXCLUDED.due_date,
           updated_at       = NOW()`,
        [student.id, structure.id, academic_year,
         tuition_fee, library_fee, other_fee,
         baseFee, due_date || null, status, req.user.id]
      );
      if (rowCount > 0) newCount++;
    }

    await client.query("COMMIT");
    res.json({
      success: true,
      data: structure,
      studentsAssigned: newCount,
      totalStudents: students.length,
      message: `Fee structure saved. ${newCount} student records created/updated.`,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("upsertStructure:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};

exports.deleteStructure = async (req, res) => {
  try {
    await pool.query("DELETE FROM fee_structures WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: "Structure deleted" });
  } catch (err) {
    console.error("deleteStructure:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT FEES
// ─────────────────────────────────────────────────────────────────────────────

exports.getStudentFees = async (req, res) => {
  try {
    const {
      class: cls, section, status, academic_year = "2024-25",
      search = "", page = 1, limit = 10,
    } = req.query;

    const params = [academic_year];
    let where = "sf.academic_year = $1";
    let idx = 2;

    if (cls)     { where += ` AND s.class = $${idx++}`;   params.push(cls); }
    if (section) { where += ` AND s.section = $${idx++}`; params.push(section); }
    if (status)  { where += ` AND sf.status = $${idx++}`; params.push(status); }
    if (search) {
      where += ` AND (u.name ILIKE $${idx} OR s.roll_number::text ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countRes = await pool.query(
      `SELECT COUNT(*)
       FROM student_fees sf
       JOIN students s ON s.id = sf.student_id
       JOIN users u ON u.id = s.user_id
       WHERE ${where}`,
      params
    );

    const { rows } = await pool.query(
      `SELECT
         sf.id, sf.student_id, sf.academic_year, sf.status, sf.note,
         sf.due_date, sf.paid_amount, sf.total_fees, sf.updated_at,
         sf.tuition_fee, sf.library_fee, sf.other_fee, sf.transport_fee,
         s.roll_number, s.class, s.section,
         u.name, u.email,
         uu.name AS last_updated_by_name
       FROM student_fees sf
       JOIN students s ON s.id = sf.student_id
       JOIN users u ON u.id = s.user_id
       LEFT JOIN fee_structures fs ON fs.id = sf.fee_structure_id
       LEFT JOIN users uu ON uu.id = sf.last_updated_by
       WHERE ${where}
       ORDER BY s.class, s.section, u.name
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: rows,
      total: parseInt(countRes.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("getStudentFees:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getStudentFeeById = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         sf.*,
         s.roll_number, s.class, s.section,
         u.name, u.email,
         uu.name AS last_updated_by_name
       FROM student_fees sf
       JOIN students s ON s.id = sf.student_id
       JOIN users u ON u.id = s.user_id
       LEFT JOIN users uu ON uu.id = sf.last_updated_by
       WHERE sf.id = $1`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Not found" });

    const { rows: payments } = await pool.query(
      `SELECT fp.*, u.name AS recorded_by_name
       FROM fee_payments fp
       LEFT JOIN users u ON u.id = fp.recorded_by
       WHERE fp.student_fee_id = $1
       ORDER BY fp.paid_on DESC`,
      [rows[0].id]
    );

    res.json({ success: true, data: { ...rows[0], payments } });
  } catch (err) {
    console.error("getStudentFeeById:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateStudentFee = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: existing } = await client.query(
      `SELECT sf.* FROM student_fees sf WHERE sf.id = $1`,
      [req.params.id]
    );
    if (!existing.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Not found" });
    }

    const rec = existing[0];
    const { paid_amount, status: explicitStatus, note, due_date, payment_amount, transport_fee } = req.body;

    const newTransport = transport_fee !== undefined ? Number(transport_fee) : Number(rec.transport_fee || 0);
    const tuition = Number(rec.tuition_fee || 0);
    const library = Number(rec.library_fee || 0);
    const other   = Number(rec.other_fee   || 0);
    const newTotal = tuition + library + other + newTransport;
    const newPaid  = paid_amount !== undefined ? Number(paid_amount) : Number(rec.paid_amount);
    const newDue   = due_date !== undefined ? due_date : rec.due_date;
    const finalStatus = explicitStatus || resolveStatus(newPaid, newTotal, newDue);

    const { rows } = await client.query(
      `UPDATE student_fees SET
         transport_fee   = $1,
         total_fees      = $2,
         paid_amount     = $3,
         status          = $4,
         note            = COALESCE($5, note),
         due_date        = $6,
         last_updated_by = $7,
         updated_at      = NOW()
       WHERE id = $8
       RETURNING *`,
      [newTransport, newTotal, newPaid, finalStatus, note ?? null, newDue, req.user.id, req.params.id]
    );

    if (payment_amount && Number(payment_amount) > 0) {
      await client.query(
        `INSERT INTO fee_payments (student_fee_id, amount, paid_on, recorded_by, note)
         VALUES ($1, $2, CURRENT_DATE, $3, $4)`,
        [req.params.id, Number(payment_amount), req.user.id, note || null]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updateStudentFee:", err);
    res.status(500).json({ success: false, message: "Server error" });
  } finally {
    client.release();
  }
};

exports.deleteStudentFee = async (req, res) => {
  try {
    await pool.query("DELETE FROM student_fees WHERE id = $1", [req.params.id]);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    console.error("deleteStudentFee:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────────────────────

exports.getStats = async (req, res) => {
  try {
    const { academic_year = "2024-25" } = req.query;

    const { rows: summary } = await pool.query(
      `SELECT
         COALESCE(SUM(paid_amount), 0)                         AS total_collected,
         COALESCE(SUM(total_fees - paid_amount), 0)            AS total_pending,
         COUNT(*) FILTER (WHERE status = 'Paid')               AS paid_count,
         COUNT(*) FILTER (WHERE status = 'Overdue')            AS overdue_count,
         COUNT(*) FILTER (WHERE status = 'Partial')            AS partial_count,
         COUNT(*) FILTER (WHERE status = 'Pending')            AS pending_count,
         COUNT(*)                                              AS total_students
       FROM student_fees WHERE academic_year = $1`,
      [academic_year]
    );

    const { rows: monthly } = await pool.query(
      `SELECT TO_CHAR(fp.paid_on,'Mon') AS month,
              DATE_TRUNC('month', fp.paid_on) AS month_start,
              COALESCE(SUM(fp.amount), 0) AS collected
       FROM fee_payments fp
       JOIN student_fees sf ON sf.id = fp.student_fee_id
       WHERE sf.academic_year = $1
         AND fp.paid_on >= NOW() - INTERVAL '6 months'
       GROUP BY TO_CHAR(fp.paid_on,'Mon'), DATE_TRUNC('month', fp.paid_on)
       ORDER BY DATE_TRUNC('month', fp.paid_on)`,
      [academic_year]
    );

    res.json({ success: true, data: { summary: summary[0], monthly } });
  } catch (err) {
    console.error("getStats:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// STUDENT SELF — apni fees dekhna
// ─────────────────────────────────────────────────────────────────────────────

exports.getMyFees = async (req, res) => {
  try {
    const { academic_year = "2024-25" } = req.query;
    const studentId = req.user.student_id || req.user.id;

    const { rows } = await pool.query(
      `SELECT
         sf.id, sf.academic_year, sf.status, sf.note,
         sf.due_date, sf.paid_amount, sf.total_fees, sf.updated_at,
         sf.tuition_fee, sf.library_fee, sf.other_fee, sf.transport_fee,
         s.class, s.section, s.roll_number,
         u.name
       FROM student_fees sf
       JOIN students s ON s.id = sf.student_id
       JOIN users u ON u.id = s.user_id
       WHERE sf.student_id = $1 AND sf.academic_year = $2
       LIMIT 1`,
      [studentId, academic_year]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: "Fee record not found" });

    const { rows: payments } = await pool.query(
      `SELECT fp.amount, fp.paid_on, fp.note, u.name AS recorded_by_name
       FROM fee_payments fp
       LEFT JOIN users u ON u.id = fp.recorded_by
       WHERE fp.student_fee_id = $1
       ORDER BY fp.paid_on DESC`,
      [rows[0].id]
    );

    res.json({ success: true, data: { ...rows[0], payments } });
  } catch (err) {
    console.error("getMyFees:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};