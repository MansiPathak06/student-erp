const pool = require("../config/db");

const PERIOD_SLOTS = {
  1: { start: "08:00:00", end: "08:45:00" },
  2: { start: "08:50:00", end: "09:35:00" },
  3: { start: "09:40:00", end: "10:25:00" },
  4: { start: "10:45:00", end: "11:30:00" },
  5: { start: "11:35:00", end: "12:20:00" },
  6: { start: "12:25:00", end: "13:10:00" },
  7: { start: "13:15:00", end: "14:00:00" },
};

const DAY_ORDER_SQL = `CASE day_of_week
  WHEN 'Monday' THEN 1
  WHEN 'Tuesday' THEN 2
  WHEN 'Wednesday' THEN 3
  WHEN 'Thursday' THEN 4
  WHEN 'Friday' THEN 5
  WHEN 'Saturday' THEN 6
  ELSE 7
END`;

const PERIOD_NUMBER_SQL = `COALESCE(
  CASE tt.start_time
    WHEN TIME '08:00:00' THEN 1
    WHEN TIME '08:50:00' THEN 2
    WHEN TIME '09:40:00' THEN 3
    WHEN TIME '10:45:00' THEN 4
    WHEN TIME '11:35:00' THEN 5
    WHEN TIME '12:25:00' THEN 6
    WHEN TIME '13:15:00' THEN 7
  END,
  ROW_NUMBER() OVER (
    PARTITION BY tt.class_id, tt.day_of_week
    ORDER BY tt.id
  )
)`;

function normalizePeriodNumber(value) {
  const periodNumber = Number.parseInt(value, 10);
  return Number.isInteger(periodNumber) && PERIOD_SLOTS[periodNumber] ? periodNumber : null;
}

function getPeriodSlot(periodNumber) {
  const normalizedPeriod = normalizePeriodNumber(periodNumber);
  return normalizedPeriod ? PERIOD_SLOTS[normalizedPeriod] : null;
}

function getPeriodNumberFromStartTime(startTime) {
  if (!startTime) return null;
  const timeValue = String(startTime).slice(0, 8);
  const match = Object.entries(PERIOD_SLOTS).find(([, slot]) => slot.start === timeValue);
  return match ? Number(match[0]) : null;
}

function createConflictError(message) {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
}

async function backfillMissingPeriodTimes(classId) {
  const missingRows = await pool.query(
    `SELECT id, day_of_week
     FROM timetable
     WHERE class_id = $1
       AND (start_time IS NULL OR end_time IS NULL)
     ORDER BY ${DAY_ORDER_SQL}, id`,
    [classId]
  );

  if (missingRows.rows.length === 0) return;

  const rowsByDay = missingRows.rows.reduce((acc, row) => {
    if (!acc[row.day_of_week]) acc[row.day_of_week] = [];
    acc[row.day_of_week].push(row);
    return acc;
  }, {});

  for (const [dayOfWeek, rows] of Object.entries(rowsByDay)) {
    const occupiedRows = await pool.query(
      `SELECT start_time
       FROM timetable
       WHERE class_id = $1
         AND day_of_week = $2
         AND start_time IS NOT NULL
       ORDER BY start_time, id`,
      [classId, dayOfWeek]
    );

    const occupiedPeriods = new Set(
      occupiedRows.rows
        .map(row => getPeriodNumberFromStartTime(row.start_time))
        .filter(Boolean)
    );

    const availablePeriods = Object.keys(PERIOD_SLOTS)
      .map(Number)
      .filter(periodNumber => !occupiedPeriods.has(periodNumber));

    for (const [index, row] of rows.entries()) {
      const nextPeriod = availablePeriods[index];
      if (!nextPeriod) break;

      const slot = PERIOD_SLOTS[nextPeriod];
      await pool.query(
        `UPDATE timetable
         SET start_time = $1,
             end_time = $2
         WHERE id = $3`,
        [slot.start, slot.end, row.id]
      );
    }
  }
}

async function ensureNoConflicts({ classId, teacherId, dayOfWeek, startTime, excludeId = null }) {
  const classConflict = await pool.query(
    `SELECT id
     FROM timetable
     WHERE class_id = $1
       AND day_of_week = $2
       AND start_time = $3
       AND ($4::int IS NULL OR id <> $4)
     LIMIT 1`,
    [classId, dayOfWeek, startTime, excludeId]
  );

  if (classConflict.rows.length > 0) {
    throw createConflictError("This class already has a period in the selected day and slot.");
  }

  const teacherConflict = await pool.query(
    `SELECT id
     FROM timetable
     WHERE teacher_id = $1
       AND day_of_week = $2
       AND start_time = $3
       AND ($4::int IS NULL OR id <> $4)
     LIMIT 1`,
    [teacherId, dayOfWeek, startTime, excludeId]
  );

  if (teacherConflict.rows.length > 0) {
    throw createConflictError("This teacher is already assigned to another class in the selected day and slot.");
  }
}

// ── GET /api/admin/timetable?class_id=5
const getTimetable = async (req, res) => {
  const { class_id } = req.query;
  if (!class_id) return res.status(400).json({ message: "class_id is required" });

  try {
    await backfillMissingPeriodTimes(class_id);

    const result = await pool.query(
      `SELECT *
       FROM (
         SELECT
           tt.id,
           tt.class_id,
           tt.teacher_id,
           tt.subject,
           tt.day_of_week,
           tt.start_time,
           tt.end_time,
           ${PERIOD_NUMBER_SQL} AS period_number,
           u.name        AS teacher_name,
           t.employee_id AS teacher_code,
           t.profile_picture
         FROM timetable tt
         JOIN teachers t ON tt.teacher_id = t.id
         JOIN users    u ON t.user_id     = u.id
         WHERE tt.class_id = $1
       ) timetable_rows
       ORDER BY ${DAY_ORDER_SQL}, period_number, id`,
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
  const { class_id, teacher_id, subject, day_of_week, period_number } = req.body;
  const slot = getPeriodSlot(period_number);

  if (!class_id || !teacher_id || !subject || !day_of_week || !slot) {
    return res.status(400).json({
      message: "class_id, teacher_id, subject, day_of_week, and a valid period_number are required",
    });
  }

  try {
    await backfillMissingPeriodTimes(class_id);
    await ensureNoConflicts({
      classId: class_id,
      teacherId: teacher_id,
      dayOfWeek: day_of_week,
      startTime: slot.start,
    });

    const result = await pool.query(
      `INSERT INTO timetable (class_id, teacher_id, subject, day_of_week, start_time, end_time)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [class_id, teacher_id, subject, day_of_week, slot.start, slot.end]
    );
    res.status(201).json({ ...result.rows[0], period_number: normalizePeriodNumber(period_number) });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ message: err.message });
    }
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
  const { teacher_id, subject, day_of_week, period_number } = req.body;

  try {
    const existingResult = await pool.query(
      `SELECT id, class_id, teacher_id, subject, day_of_week, start_time
       FROM timetable
       WHERE id = $1`,
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Period not found" });
    }

    const existingPeriod = existingResult.rows[0];
    const nextTeacherId = teacher_id ?? existingPeriod.teacher_id;
    const nextSubject = subject ?? existingPeriod.subject;
    const nextDayOfWeek = day_of_week ?? existingPeriod.day_of_week;
    const nextPeriodNumber =
      normalizePeriodNumber(period_number) ??
      getPeriodNumberFromStartTime(existingPeriod.start_time);
    const slot = getPeriodSlot(nextPeriodNumber);

    if (!slot) {
      return res.status(400).json({ message: "A valid period_number is required" });
    }

    await backfillMissingPeriodTimes(existingPeriod.class_id);
    await ensureNoConflicts({
      classId: existingPeriod.class_id,
      teacherId: nextTeacherId,
      dayOfWeek: nextDayOfWeek,
      startTime: slot.start,
      excludeId: Number(id),
    });

    const result = await pool.query(
      `UPDATE timetable
       SET teacher_id  = $1,
           subject     = $2,
           day_of_week = $3,
           start_time  = $4,
           end_time    = $5
       WHERE id = $6
       RETURNING *`,
      [nextTeacherId, nextSubject, nextDayOfWeek, slot.start, slot.end, id]
    );
    res.json({ ...result.rows[0], period_number: nextPeriodNumber });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ message: err.message });
    }
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
