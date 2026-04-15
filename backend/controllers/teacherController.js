const pool   = require("../config/db");
const bcrypt = require("bcryptjs");
const path   = require("path");

// ── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
  name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

const SUBJECT_COLORS = {
  Physics:        { bg: "bg-violet-100",  text: "text-violet-700"  },
  Mathematics:    { bg: "bg-sky-100",     text: "text-sky-700"     },
  English:        { bg: "bg-rose-100",    text: "text-rose-700"    },
  Chemistry:      { bg: "bg-emerald-100", text: "text-emerald-700" },
  History:        { bg: "bg-amber-100",   text: "text-amber-700"   },
  Statistics:     { bg: "bg-indigo-100",  text: "text-indigo-700"  },
  "Fine Arts":    { bg: "bg-pink-100",    text: "text-pink-700"    },
  "Physical Ed.": { bg: "bg-teal-100",    text: "text-teal-700"    },
  Biology:        { bg: "bg-green-100",   text: "text-green-700"   },
};

const AVATAR_COLORS = [
  "bg-violet-500","bg-sky-500","bg-rose-500","bg-emerald-500",
  "bg-amber-500","bg-indigo-500","bg-pink-500","bg-teal-500",
];

const getSubjectColors = (subject) =>
  SUBJECT_COLORS[subject] ?? { bg: "bg-gray-100", text: "text-gray-700" };

const getAvatarColor = (id) =>
  AVATAR_COLORS[id % AVATAR_COLORS.length];

// ── Admin: GET /api/admin/teachers ───────────────────────────────────────────

const getAllTeachers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        t.id,
        t.employee_id,
        t.subject,
        t.department,
        t.experience,
        t.status,
        t.pending_tasks,
        t.teacher_type,
        t.class_teacher_class,
        t.class_teacher_section,
        t.subject_assignments,
        t.phone,
        t.profile_picture,
        t.date_of_joining,
        u.name,
        u.email
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.id
    `);

    const teachers = result.rows.map((t) => {
      const { bg, text } = getSubjectColors(t.subject);
      return {
        id:                 t.employee_id || `TCH-${String(t.id).padStart(3, "0")}`,
        dbId:               t.id,
        name:               t.name,
        email:              t.email,
        phone:              t.phone       || "",
        avatar:             getInitials(t.name),
        avatarColor:        getAvatarColor(t.id),
        department:         t.department  || "—",
        subject:            t.subject     || "—",
        subjectBg:          bg,
        subjectText:        text,
        experience:         t.experience  || 0,
        status:             t.status      || "Active",
        pendingTasks:       t.pending_tasks || 0,
        teacherType:        t.teacher_type        || "Subject Teacher",
        classTeacherClass:  t.class_teacher_class  || "",
        classTeacherSection:t.class_teacher_section || "",
        subjectAssignments: t.subject_assignments  || [],
        profilePicture:     t.profile_picture      || null,
      };
    });

    res.json(teachers);
  } catch (err) {
    console.error("getAllTeachers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Admin: GET /api/admin/teachers/meta ──────────────────────────────────────

const getTeacherMeta = async (req, res) => {
  try {
    const deps  = await pool.query("SELECT DISTINCT department FROM teachers WHERE department IS NOT NULL ORDER BY department");
    const subjs = await pool.query("SELECT DISTINCT subject    FROM teachers WHERE subject    IS NOT NULL ORDER BY subject");
    res.json({
      departments: deps.rows.map(r => r.department),
      subjects:    subjs.rows.map(r => r.subject),
    });
  } catch (err) {
    console.error("getTeacherMeta:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Admin: POST /api/admin/teachers ──────────────────────────────────────────
// Expects multipart/form-data (name, email, password, phone, teacherType,
// classTeacherClass, classTeacherSection, subjectAssignments JSON string,
// profilePicture file, status)

const createTeacher = async (req, res) => {
  const {
    name, email, password, phone,
    teacherType, classTeacherClass, classTeacherSection,
    subjectAssignments, status,
  } = req.body;

  // Basic validation
  if (!name || !email || !password)
    return res.status(400).json({ message: "name, email, and password are required" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Hash password and create user
    const hashed    = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'teacher') RETURNING id`,
      [name.trim(), email.trim().toLowerCase(), hashed]
    );
    const userId = userResult.rows[0].id;

    // 2. Handle profile picture path (if uploaded via multer)
    const profilePicture = req.file
      ? `/uploads/teachers/${req.file.filename}`
      : null;

    // 3. Parse subject assignments
    let parsedSubjectAssignments = [];
    if (subjectAssignments) {
      try {
        parsedSubjectAssignments = JSON.parse(subjectAssignments);
      } catch {
        // ignore parse error — leave empty
      }
    }

    // 4. Derive primary subject from first assignment (for legacy columns)
    const primarySubject = parsedSubjectAssignments[0]?.subject || null;

    // 5. Generate employee_id
    const countResult  = await client.query("SELECT COUNT(*) FROM teachers");
    const count        = parseInt(countResult.rows[0].count, 10) + 1;
    const employeeId   = `TCH-${String(count).padStart(3, "0")}`;

    // 6. Insert teacher
    const teacherResult = await client.query(
      `INSERT INTO teachers
         (user_id, employee_id, phone, subject, status,
          teacher_type, class_teacher_class, class_teacher_section,
          subject_assignments, profile_picture)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        userId,
        employeeId,
        phone?.trim() || null,
        primarySubject,
        status || "Active",
        teacherType || "Subject Teacher",
        classTeacherClass  || null,
        classTeacherSection || null,
        JSON.stringify(parsedSubjectAssignments),
        profilePicture,
      ]
    );
    const teacherId = teacherResult.rows[0].id;

    await client.query("COMMIT");

    // 7. Return shaped teacher object (matches frontend shape)
    const { bg, text } = getSubjectColors(primarySubject);
    res.status(201).json({
      id:                  employeeId,
      dbId:                teacherId,
      name:                name.trim(),
      email:               email.trim().toLowerCase(),
      phone:               phone?.trim() || "",
      avatar:              getInitials(name),
      avatarColor:         getAvatarColor(teacherId),
      department:          "—",
      subject:             primarySubject || "—",
      subjectBg:           bg,
      subjectText:         text,
      experience:          0,
      status:              status || "Active",
      pendingTasks:        0,
      teacherType:         teacherType || "Subject Teacher",
      classTeacherClass:   classTeacherClass  || "",
      classTeacherSection: classTeacherSection || "",
      subjectAssignments:  parsedSubjectAssignments,
      profilePicture:      profilePicture,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createTeacher:", err);
    if (err.code === "23505")
      return res.status(409).json({ message: "Email already exists" });
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// ── Admin: DELETE /api/admin/teachers/:id ────────────────────────────────────

const deleteTeacher = async (req, res) => {
  const { id } = req.params;             // This is employee_id string like "TCH-001"
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Find the teacher record
    const teacher = await client.query(
      "SELECT id, user_id FROM teachers WHERE employee_id = $1", [id]
    );
    if (teacher.rows.length === 0)
      return res.status(404).json({ message: "Teacher not found" });

    const { id: teacherId, user_id: userId } = teacher.rows[0];

    // Delete dependent records first
    await client.query("DELETE FROM classes     WHERE teacher_id = $1", [teacherId]);
    await client.query("DELETE FROM assignments WHERE teacher_id = $1", [teacherId]);
    await client.query("DELETE FROM teachers    WHERE id = $1",         [teacherId]);
    await client.query("DELETE FROM users       WHERE id = $1",         [userId]);

    await client.query("COMMIT");
    res.json({ message: "Teacher deleted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("deleteTeacher:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// ── Teacher: GET /api/teacher/profile ────────────────────────────────────────

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name, u.email
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Profile not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("getProfile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Teacher: GET /api/teacher/classes ────────────────────────────────────────

const getClasses = async (req, res) => {
  try {
    const teacher = await pool.query(
      "SELECT id FROM teachers WHERE user_id = $1", [req.user.id]
    );
    if (teacher.rows.length === 0)
      return res.status(404).json({ message: "Teacher not found" });
    const result = await pool.query(
      "SELECT * FROM classes WHERE teacher_id = $1 ORDER BY class_name, section",
      [teacher.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getClasses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Teacher: GET /api/teacher/students ───────────────────────────────────────

const getStudents = async (req, res) => {
  try {
    const teacher = await pool.query(
      "SELECT id FROM teachers WHERE user_id = $1", [req.user.id]
    );
    if (teacher.rows.length === 0)
      return res.status(404).json({ message: "Teacher not found" });
    const classes = await pool.query(
      "SELECT class_name, section FROM classes WHERE teacher_id = $1",
      [teacher.rows[0].id]
    );
    if (classes.rows.length === 0) return res.json([]);
    const conditions = classes.rows
      .map((_, i) => `(s.class = $${i * 2 + 1} AND s.section = $${i * 2 + 2})`)
      .join(" OR ");
    const values = classes.rows.flatMap(c => [c.class_name, c.section]);
    const result = await pool.query(
      `SELECT s.*, u.name, u.email
       FROM students s JOIN users u ON s.user_id = u.id
       WHERE ${conditions} ORDER BY s.class, s.roll_number`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getStudents:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Teacher: POST /api/teacher/attendance ────────────────────────────────────

const markAttendance = async (req, res) => {
  const { attendance } = req.body;
  if (!Array.isArray(attendance) || attendance.length === 0)
    return res.status(400).json({ message: "attendance array required" });
  try {
    const placeholders = attendance
      .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
      .join(", ");
    const values = attendance.flatMap(a => [a.student_id, a.date, a.status, req.user.id]);
    await pool.query(
      `INSERT INTO attendance (student_id, date, status, marked_by)
       VALUES ${placeholders}
       ON CONFLICT (student_id, date)
       DO UPDATE SET status = EXCLUDED.status, marked_by = EXCLUDED.marked_by`,
      values
    );
    res.json({ message: "Attendance marked successfully" });
  } catch (err) {
    console.error("markAttendance:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Teacher: POST /api/teacher/assignments ───────────────────────────────────

const createAssignment = async (req, res) => {
  const { class_id, title, description, due_date } = req.body;
  if (!class_id || !title)
    return res.status(400).json({ message: "class_id and title are required" });
  try {
    const teacher = await pool.query(
      "SELECT id FROM teachers WHERE user_id = $1", [req.user.id]
    );
    if (teacher.rows.length === 0)
      return res.status(404).json({ message: "Teacher not found" });
    const result = await pool.query(
      `INSERT INTO assignments (teacher_id, class_id, title, description, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [teacher.rows[0].id, class_id, title, description, due_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createAssignment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Teacher: POST /api/teacher/results ───────────────────────────────────────

const addResult = async (req, res) => {
  const { student_id, subject, marks_obtained, total_marks, exam_type, exam_date } = req.body;
  if (!student_id || !subject || marks_obtained == null || !total_marks)
    return res.status(400).json({ message: "student_id, subject, marks_obtained, total_marks required" });
  try {
    const result = await pool.query(
      `INSERT INTO results (student_id, subject, marks_obtained, total_marks, exam_type, exam_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [student_id, subject, marks_obtained, total_marks, exam_type, exam_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("addResult:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ── Admin: PUT /api/admin/teachers/:id ───────────────────────────────────────

const updateTeacher = async (req, res) => {
  const { id } = req.params; // employee_id like "TCH-001"
  const {
    name, phone, teacherType, classTeacherClass, classTeacherSection,
    subjectAssignments, status, password, existingProfilePicture,
  } = req.body;

  if (!name) return res.status(400).json({ message: "Name is required" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Find the teacher
    const teacherResult = await client.query(
      "SELECT t.id, t.user_id FROM teachers t WHERE t.employee_id = $1",
      [id]
    );
    if (teacherResult.rows.length === 0) {
      return res.status(404).json({ message: "Teacher not found" });
    }
    const { id: teacherId, user_id: userId } = teacherResult.rows[0];

    // Update user name
    await client.query("UPDATE users SET name = $1 WHERE id = $2", [name.trim(), userId]);

    // Update password if provided
    if (password && password.trim()) {
      const hashed = await bcrypt.hash(password, 10);
      await client.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, userId]);
    }

    // Handle profile picture
    let profilePicture = existingProfilePicture || null;
    if (req.file) {
      profilePicture = `/uploads/teachers/${req.file.filename}`;
    }

    // Parse subject assignments
    let parsedSubjectAssignments = [];
    if (subjectAssignments) {
      try {
        parsedSubjectAssignments = JSON.parse(subjectAssignments);
      } catch (e) {
        // ignore
      }
    }

    const primarySubject = parsedSubjectAssignments[0]?.subject || null;

    // Update teacher
    await client.query(
      `UPDATE teachers SET
        phone = $1,
        subject = $2,
        status = $3,
        teacher_type = $4,
        class_teacher_class = $5,
        class_teacher_section = $6,
        subject_assignments = $7,
        profile_picture = COALESCE($8, profile_picture)
      WHERE id = $9`,
      [
        phone?.trim() || null,
        primarySubject,
        status || "Active",
        teacherType || "Subject Teacher",
        classTeacherClass || null,
        classTeacherSection || null,
        JSON.stringify(parsedSubjectAssignments),
        profilePicture,
        teacherId,
      ]
    );

    await client.query("COMMIT");

    // Fetch updated teacher data
    const updated = await client.query(`
      SELECT t.*, u.name, u.email
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE t.id = $1
    `, [teacherId]);

    const t = updated.rows[0];
    const { bg, text } = getSubjectColors(t.subject);

    res.json({
      id: t.employee_id,
      dbId: t.id,
      name: t.name,
      email: t.email,
      phone: t.phone || "",
      avatar: getInitials(t.name),
      avatarColor: getAvatarColor(t.id),
      department: t.department || "—",
      subject: t.subject || "—",
      subjectBg: bg,
      subjectText: text,
      experience: t.experience || 0,
      status: t.status,
      pendingTasks: t.pending_tasks || 0,
      teacherType: t.teacher_type,
      classTeacherClass: t.class_teacher_class || "",
      classTeacherSection: t.class_teacher_section || "",
      subjectAssignments: t.subject_assignments || [],
      profilePicture: t.profile_picture,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updateTeacher:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

module.exports = {
  getAllTeachers,
  getTeacherMeta,
  createTeacher,
  deleteTeacher,
  getProfile,
  getClasses,
  getStudents,
  markAttendance,
  createAssignment,
  addResult,
    updateTeacher, 
};