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
        u.name        AS teacher_name,
        t.teacher_type AS teacher_type
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users   u ON t.user_id     = u.id
      ORDER BY c.created_at DESC
    `);

    const classes = result.rows.map((c) => ({
      id:           `CLS-${String(c.id).padStart(3, "0")}`,
      dbId:         c.id,
      grade:        c.grade || c.class_name || "—",
      section:      c.section || "—",
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
        SELECT t.id, u.name, t.teacher_type
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
// POST /api/admin/classes
const createClass = async (req, res) => {
  const { class_name, section, grade, teacher_id } = req.body;

  if (!grade || !section) {
    return res.status(400).json({ message: "Grade and section are required." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if class already exists
    const existingClass = await client.query(
      "SELECT id FROM classes WHERE grade = $1 AND section = $2",
      [grade, section]
    );
    
    if (existingClass.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ message: "Class already exists!" });
    }

    // If a teacher is assigned, check if they are already a class teacher for another class
    if (teacher_id) {
      const existingTeacherClass = await client.query(
        `SELECT c.grade, c.section, u.name as teacher_name
         FROM classes c
         JOIN teachers t ON c.teacher_id = t.id
         JOIN users u ON t.user_id = u.id
         WHERE c.teacher_id = $1`,
        [teacher_id]
      );
      
      if (existingTeacherClass.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({ 
          message: `Teacher ${existingTeacherClass.rows[0].teacher_name} is already the class teacher for Class ${existingTeacherClass.rows[0].grade}-${existingTeacherClass.rows[0].section}. 
                   A teacher can only be class teacher for one class.` 
        });
      }
    }

    // Create the class
    const result = await client.query(
      `INSERT INTO classes (class_name, section, grade, teacher_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [class_name || grade, section, grade, teacher_id || null]
    );

    // If a teacher is assigned as class teacher, update their type
    if (teacher_id) {
      await client.query(
        `UPDATE teachers 
         SET teacher_type = CASE 
           WHEN teacher_type = 'Subject Teacher' THEN 'Both'
           WHEN teacher_type IS NULL OR teacher_type = '' THEN 'Class Teacher'
           ELSE teacher_type 
         END
         WHERE id = $1`,
        [teacher_id]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Class created", class: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("createClass:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// GET /api/admin/teachers/check-class - Check if teacher already has a class
const checkTeacherClassAssignment = async (req, res) => {
  const { teacherId, excludeClassId } = req.query;
  try {
    let query = `
      SELECT c.id, c.grade, c.section, u.name as teacher_name
      FROM classes c
      JOIN teachers t ON c.teacher_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE c.teacher_id = $1
    `;
    let params = [teacherId];
    
    if (excludeClassId) {
      query += ` AND c.id != $2`;
      params.push(excludeClassId);
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length > 0) {
      res.json({ 
        hasClass: true, 
        grade: result.rows[0].grade,
        section: result.rows[0].section,
        className: `${result.rows[0].grade}-${result.rows[0].section}`
      });
    } else {
      res.json({ hasClass: false });
    }
  } catch (err) {
    console.error("checkTeacherClassAssignment:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/classes/:id
// PUT /api/admin/classes/:id
const updateClass = async (req, res) => {
  const { id } = req.params;
  const { class_name, section, grade, teacher_id } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get the old teacher_id before update
    const oldClass = await client.query(
      "SELECT teacher_id FROM classes WHERE id = $1",
      [id]
    );
    
    const oldTeacherId = oldClass.rows[0]?.teacher_id;

    // If trying to assign a teacher to this class
    if (teacher_id && teacher_id !== oldTeacherId) {
      // Check if this teacher is already a class teacher for ANOTHER class
      const existingAssignment = await client.query(
        `SELECT c.id, c.grade, c.section, u.name as teacher_name
         FROM classes c
         JOIN teachers t ON c.teacher_id = t.id
         JOIN users u ON t.user_id = u.id
         WHERE c.teacher_id = $1 AND c.id != $2`,
        [teacher_id, id]
      );
      
      if (existingAssignment.rows.length > 0) {
        await client.query("ROLLBACK");
        return res.status(409).json({ 
          message: `Teacher ${existingAssignment.rows[0].teacher_name} is already the class teacher for Class ${existingAssignment.rows[0].grade}-${existingAssignment.rows[0].section}. 
                   A teacher can only be class teacher for one class.` 
        });
      }
    }

    // Update the class
    const result = await client.query(
      `UPDATE classes
       SET class_name = $1,
           section    = $2,
           grade      = $3,
           teacher_id = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [class_name || grade, section, grade, teacher_id || null, id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Class not found" });
    }

    // Handle teacher type updates for old teacher (if removed as class teacher)
    if (oldTeacherId && oldTeacherId !== teacher_id) {
      // Check if teacher still has any other classes assigned
      const otherClasses = await client.query(
        "SELECT id FROM classes WHERE teacher_id = $1 AND id != $2",
        [oldTeacherId, id]
      );
      
      if (otherClasses.rows.length === 0) {
        // Teacher is no longer a class teacher for any class
        await client.query(
          `UPDATE teachers 
           SET teacher_type = CASE 
             WHEN teacher_type = 'Both' THEN 'Subject Teacher'
             WHEN teacher_type = 'Class Teacher' THEN 'Subject Teacher'
             ELSE teacher_type 
           END
           WHERE id = $1`,
          [oldTeacherId]
        );
      }
    }

    // Add class teacher role to new teacher
    if (teacher_id) {
      await client.query(
        `UPDATE teachers 
         SET teacher_type = CASE 
           WHEN teacher_type = 'Subject Teacher' THEN 'Both'
           WHEN teacher_type IS NULL OR teacher_type = '' THEN 'Class Teacher'
           ELSE teacher_type 
         END
         WHERE id = $1`,
        [teacher_id]
      );
    }

    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("updateClass:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// DELETE /api/admin/classes/:id
const deleteClass = async (req, res) => {
  const { id } = req.params;
  
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get the teacher_id before deletion
    const classData = await client.query(
      "SELECT teacher_id FROM classes WHERE id = $1",
      [id]
    );
    const teacherId = classData.rows[0]?.teacher_id;

    // Delete the class
    const result = await client.query(
      "DELETE FROM classes WHERE id = $1 RETURNING id",
      [id]
    );
    
    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Class not found" });
    }

    // Update teacher type if they no longer have any classes
    if (teacherId) {
      const otherClasses = await client.query(
        "SELECT id FROM classes WHERE teacher_id = $1",
        [teacherId]
      );
      
      if (otherClasses.rows.length === 0) {
        await client.query(
          `UPDATE teachers 
           SET teacher_type = CASE 
             WHEN teacher_type = 'Both' THEN 'Subject Teacher'
             WHEN teacher_type = 'Class Teacher' THEN NULL
             ELSE teacher_type 
           END
           WHERE id = $1`,
          [teacherId]
        );
      }
    }

    await client.query("COMMIT");
    res.json({ message: "Class deleted" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("deleteClass:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
};

// GET /api/admin/classes/check - Check if class has teacher
const checkClassTeacher = async (req, res) => {
  const { grade, section } = req.query;
  try {
    const result = await pool.query(
      `SELECT c.teacher_id, u.name as teacher_name
       FROM classes c
       LEFT JOIN teachers t ON c.teacher_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE c.grade = $1 AND c.section = $2 AND c.teacher_id IS NOT NULL`,
      [grade, section]
    );
    
    if (result.rows.length > 0) {
      res.json({ 
        hasClassTeacher: true, 
        teacherId: result.rows[0].teacher_id,
        teacherName: result.rows[0].teacher_name
      });
    } else {
      res.json({ hasClassTeacher: false });
    }
  } catch (err) {
    console.error("checkClassTeacher:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllClasses, getClassMeta, createClass, updateClass, deleteClass,checkClassTeacher,checkTeacherClassAssignment };