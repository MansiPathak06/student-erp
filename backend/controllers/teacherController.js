const pool   = require("../config/db");
const bcrypt = require("bcryptjs");
const path   = require("path");

// ── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name = "") =>
  name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();

// ADD THIS FUNCTION RIGHT HERE
const getAvatarColor = (id) =>
  AVATAR_COLORS[id % AVATAR_COLORS.length];

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



// ── Admin: GET /api/admin/teachers ───────────────────────────────────────────

// UPDATE getAllTeachers function - Fix the teacher_id reference
const getAllTeachers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.phone,
        t.teacher_type AS "teacherType",
        t.status,
        t.created_at,
        u.name,
        u.email,
        (
          SELECT json_agg(
            json_build_object(
              'subject', ts.subject,
              'className', ts.class_name,
              'section', ts.section
            )
          )
          FROM teacher_subjects ts
          WHERE ts.teacher_id = t.id
        ) AS "subjectAssignments",
        (
          SELECT json_build_object(
            'class', c.grade,
            'section', c.section
          )
          FROM classes c
          WHERE c.teacher_id = t.id
          LIMIT 1
        ) AS "classTeacherAssignment"
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `);

    // Format the response
    const teachers = result.rows.map(t => ({
      id: `TCH-${String(t.id).padStart(3, "0")}`,
      dbId: t.id,
      name: t.name,
      email: t.email,
      phone: t.phone,
      teacherType: t.teacherType || "Subject Teacher",
      status: t.status || "Active",
      subjectAssignments: t.subjectAssignments || [],
      classTeacherClass: t.classTeacherAssignment?.class || "",
      classTeacherSection: t.classTeacherAssignment?.section || "",
      avatar: getInitials(t.name),
      avatarColor: AVATAR_COLORS[t.id % AVATAR_COLORS.length],
    }));

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

// Add this helper function at the top of teacherController.js
const checkClassTeacherExists = async (client, grade, section, excludeTeacherId = null) => {
  const query = `
    SELECT c.id, c.teacher_id, u.name as teacher_name
    FROM classes c
    LEFT JOIN teachers t ON c.teacher_id = t.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE c.grade = $1 AND c.section = $2
    ${excludeTeacherId ? 'AND c.teacher_id != $3' : ''}
  `;
  
  const params = excludeTeacherId 
    ? [grade, section, excludeTeacherId]
    : [grade, section];
    
  const result = await client.query(query, params);
  return result.rows[0] || null;
};

// UPDATE createTeacher function
const createTeacher = async (req, res) => {
  const { name, email, password, phone, teacherType, classTeacherClass, classTeacherSection, subjectAssignments, status } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, 'teacher') RETURNING id",
      [name, email, hashedPassword]
    );
    const userId = userResult.rows[0].id;

    // Create teacher
    const teacherResult = await client.query(
      `INSERT INTO teachers (user_id, phone, teacher_type, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, phone, teacherType, status || 'Active']
    );
    const teacherId = teacherResult.rows[0].id;

    // Handle class teacher assignment
    if ((teacherType === 'Class Teacher' || teacherType === 'Both') && classTeacherClass && classTeacherSection) {
      // CHECK if class already has a teacher assigned
      const existingClassTeacher = await checkClassTeacherExists(
        client, 
        classTeacherClass, 
        classTeacherSection
      );
      
      if (existingClassTeacher && existingClassTeacher.teacher_id) {
        await client.query("ROLLBACK");
        return res.status(409).json({ 
          message: `Class ${classTeacherClass}-${classTeacherSection} already has a class teacher: ${existingClassTeacher.teacher_name}. 
                   Please remove them first before assigning a new one.` 
        });
      }
      
      // Check if class already exists
      let classResult = await client.query(
        "SELECT id FROM classes WHERE grade = $1 AND section = $2",
        [classTeacherClass, classTeacherSection]
      );
      
      if (classResult.rows.length > 0) {
        // Update existing class with this teacher
        await client.query(
          "UPDATE classes SET teacher_id = $1 WHERE id = $2",
          [teacherId, classResult.rows[0].id]
        );
      } else {
        // Create new class
        await client.query(
          `INSERT INTO classes (class_name, grade, section, teacher_id)
           VALUES ($1, $2, $3, $4)`,
          [`Class ${classTeacherClass}`, classTeacherClass, classTeacherSection, teacherId]
        );
      }
    }

    // Handle subject assignments (rest of your existing code)
    if (subjectAssignments && (teacherType === 'Subject Teacher' || teacherType === 'Both')) {
      const assignments = JSON.parse(subjectAssignments);
      for (const assignment of assignments) {
        if (assignment.subject && assignment.className && assignment.section) {
          await client.query(
            `INSERT INTO teacher_subjects (teacher_id, subject, class_name, section)
             VALUES ($1, $2, $3, $4)`,
            [teacherId, assignment.subject, assignment.className, assignment.section]
          );
        }
      }
    }

    await client.query("COMMIT");
    
    const finalResult = await client.query(
      `SELECT t.*, u.name, u.email 
       FROM teachers t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = $1`,
      [teacherId]
    );
    
    res.status(201).json(finalResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createTeacher:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// UPDATE updateTeacher function
const updateTeacher = async (req, res) => {
  const { id } = req.params;
  const { name, phone, teacherType, classTeacherClass, classTeacherSection, subjectAssignments, status } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get current teacher info
    const currentTeacher = await client.query(
      `SELECT t.*, u.name as user_name 
       FROM teachers t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = $1`,
      [id]
    );
    
    if (currentTeacher.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Update user info
    if (name && name !== currentTeacher.rows[0].user_name) {
      await client.query(
        "UPDATE users SET name = $1 WHERE id = (SELECT user_id FROM teachers WHERE id = $2)",
        [name, id]
      );
    }

    // Update teacher info
    await client.query(
      `UPDATE teachers SET 
        phone = COALESCE($1, phone),
        teacher_type = COALESCE($2, teacher_type),
        status = COALESCE($3, status),
        updated_at = NOW()
       WHERE id = $4`,
      [phone, teacherType, status, id]
    );

    // Handle class teacher assignment
    const newTeacherType = teacherType || currentTeacher.rows[0].teacher_type;
    
    if (newTeacherType === 'Class Teacher' || newTeacherType === 'Both') {
      if (classTeacherClass && classTeacherSection) {
        // CHECK if class already has a DIFFERENT teacher assigned
        const existingClassTeacher = await checkClassTeacherExists(
          client, 
          classTeacherClass, 
          classTeacherSection,
          parseInt(id) // Exclude current teacher from check
        );
        
        if (existingClassTeacher && existingClassTeacher.teacher_id) {
          await client.query("ROLLBACK");
          return res.status(409).json({ 
            message: `Class ${classTeacherClass}-${classTeacherSection} already has a class teacher: ${existingClassTeacher.teacher_name}. 
                     Please remove them first before assigning a new one.` 
          });
        }
        
        // Check if class already exists
        let classResult = await client.query(
          "SELECT id FROM classes WHERE grade = $1 AND section = $2",
          [classTeacherClass, classTeacherSection]
        );
        
        if (classResult.rows.length > 0) {
          // Update existing class with this teacher
          await client.query(
            "UPDATE classes SET teacher_id = $1 WHERE id = $2",
            [id, classResult.rows[0].id]
          );
        } else {
          // Create new class
          await client.query(
            `INSERT INTO classes (class_name, grade, section, teacher_id)
             VALUES ($1, $2, $3, $4)`,
            [`Class ${classTeacherClass}`, classTeacherClass, classTeacherSection, id]
          );
        }
      }
    } else {
      // If teacher is no longer a class teacher, remove them from classes
      await client.query(
        "UPDATE classes SET teacher_id = NULL WHERE teacher_id = $1",
        [id]
      );
    }

    // Handle subject assignments
    if (subjectAssignments) {
      await client.query("DELETE FROM teacher_subjects WHERE teacher_id = $1", [id]);
      
      const assignments = JSON.parse(subjectAssignments);
      for (const assignment of assignments) {
        if (assignment.subject && assignment.className && assignment.section) {
          await client.query(
            `INSERT INTO teacher_subjects (teacher_id, subject, class_name, section)
             VALUES ($1, $2, $3, $4)`,
            [id, assignment.subject, assignment.className, assignment.section]
          );
        }
      }
    }

    await client.query("COMMIT");
    
    // Get updated teacher
    const finalResult = await client.query(
      `SELECT t.*, u.name, u.email 
       FROM teachers t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = $1`,
      [id]
    );
    
    res.json(finalResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updateTeacher:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// DELETE /api/admin/teachers/:id
const deleteTeacher = async (req, res) => {
  const { id } = req.params;
  
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Remove teacher from any classes they're assigned to
    await client.query(
      "UPDATE classes SET teacher_id = NULL WHERE teacher_id = $1",
      [id]
    );

    // Get user_id
    const teacherResult = await client.query(
      "SELECT user_id FROM teachers WHERE id = $1",
      [id]
    );
    
    if (teacherResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Teacher not found" });
    }
    
    const userId = teacherResult.rows[0].user_id;
    
    // Delete teacher
    await client.query("DELETE FROM teachers WHERE id = $1", [id]);
    
    // Delete user
    await client.query("DELETE FROM users WHERE id = $1", [userId]);
    
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

// Add this helper function to check if teacher is already a class teacher
const checkTeacherAlreadyClassTeacher = async (client, teacherId, excludeClassId = null) => {
  const query = `
    SELECT c.id, c.grade, c.section
    FROM classes c
    WHERE c.teacher_id = $1
    ${excludeClassId ? 'AND c.id != $2' : ''}
  `;
  
  const params = excludeClassId ? [teacherId, excludeClassId] : [teacherId];
  const result = await client.query(query, params);
  return result.rows[0] || null;
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
    checkTeacherAlreadyClassTeacher,
};