const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── Multer config for Aadhaar image uploads ──────────────────────────────────
const aadharStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/aadhar";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `aadhar_${req.params.id}_${Date.now()}${ext}`);
  },
});

const aadharUpload = multer({
  storage: aadharStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, WebP or PDF allowed for Aadhaar"));
  },
});

// ─── GET /api/student/profile ─────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, u.name, u.email FROM students s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.user_id = $1`,
      [req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Profile not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET /api/student/attendance ──────────────────────────────────────────────
const getAttendance = async (req, res) => {
  try {
    const student = await pool.query(
      "SELECT id FROM students WHERE user_id=$1",
      [req.user.id]
    );
    if (student.rows.length === 0)
      return res.status(404).json({ message: "Student not found" });

    const result = await pool.query(
      "SELECT * FROM attendance WHERE student_id=$1 ORDER BY date DESC LIMIT 60",
      [student.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET /api/student/results ─────────────────────────────────────────────────
const getResults = async (req, res) => {
  try {
    const student = await pool.query(
      "SELECT id FROM students WHERE user_id=$1",
      [req.user.id]
    );
    if (student.rows.length === 0)
      return res.status(404).json({ message: "Student not found" });

    const result = await pool.query(
      "SELECT * FROM results WHERE student_id=$1 ORDER BY exam_date DESC",
      [student.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET /api/student/fees ────────────────────────────────────────────────────
const getFees = async (req, res) => {
  try {
    const student = await pool.query(
      "SELECT id FROM students WHERE user_id=$1",
      [req.user.id]
    );
    if (student.rows.length === 0)
      return res.status(404).json({ message: "Student not found" });

    const result = await pool.query(
      "SELECT * FROM fees WHERE student_id=$1 ORDER BY due_date DESC",
      [student.rows[0].id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET /api/student/assignments ─────────────────────────────────────────────
const getAssignments = async (req, res) => {
  try {
    const student = await pool.query(
      "SELECT class, section FROM students WHERE user_id=$1",
      [req.user.id]
    );
    if (student.rows.length === 0)
      return res.status(404).json({ message: "Student not found" });

    const { class: cls, section } = student.rows[0];
    const result = await pool.query(
      `SELECT a.*, u.name as teacher_name FROM assignments a
       JOIN classes c ON a.class_id = c.id
       JOIN teachers t ON a.teacher_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE c.class_name=$1 AND c.section=$2
       ORDER BY a.due_date DESC`,
      [cls, section]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET /api/student/timetable ───────────────────────────────────────────────
const getTimetable = async (req, res) => {
  try {
    // class_id directly use karo — name matching se bachao
    const student = await pool.query(
      "SELECT class_id, class, section FROM students WHERE user_id=$1",
      [req.user.id]
    );
    if (student.rows.length === 0)
      return res.status(404).json({ message: "Student not found" });

    const { class_id, class: cls, section } = student.rows[0];
    
    console.log("DEBUG timetable:", { class_id, cls, section }); // debug ke liye

    if (!class_id) {
      return res.json([]); // class_id nahi hai toh empty
    }

  const result = await pool.query(
  `SELECT 
     tt.id,
     tt.class_id,
     tt.teacher_id,
     tt.subject,
     tt.day_of_week,
     tt.start_time,
     tt.end_time,
     CASE tt.start_time
       WHEN '08:00:00' THEN 1
       WHEN '08:50:00' THEN 2
       WHEN '09:40:00' THEN 3
       WHEN '10:45:00' THEN 4
       WHEN '11:35:00' THEN 5
       WHEN '12:25:00' THEN 6
       WHEN '13:15:00' THEN 7
     END AS period_number,
     u.name AS teacher_name
   FROM timetable tt
   JOIN teachers t ON tt.teacher_id = t.id
   JOIN users u ON t.user_id = u.id
   WHERE tt.class_id = $1
   ORDER BY 
     CASE tt.day_of_week
       WHEN 'Monday'    THEN 1
       WHEN 'Tuesday'   THEN 2
       WHEN 'Wednesday' THEN 3
       WHEN 'Thursday'  THEN 4
       WHEN 'Friday'    THEN 5
       WHEN 'Saturday'  THEN 6
     END,
     tt.start_time`,
  [class_id]
);
    res.json(result.rows);
  } catch (err) {
    console.error("getTimetable error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── GET /api/student/teachers ────────────────────────────────────────────────
const getTeachers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, u.name, u.email, t.subject, t.phone
       FROM teachers t
       JOIN users u ON t.user_id = u.id
       ORDER BY u.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getTeachers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ─── POST /api/student/:id/aadhar-image ───────────────────────────────────────
// Upload Aadhaar card image and save URL to DB
const uploadAadharImage = [
  aadharUpload.single("aadhar_image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Build the public URL path (adjust base URL to match your server setup)
      const imageUrl = `/uploads/aadhar/${req.file.filename}`;

      await pool.query(
        "UPDATE students SET aadhar_image_url = $1 WHERE id = $2",
        [imageUrl, req.params.id]
      );

      res.json({
        message: "Aadhaar image uploaded successfully",
        aadhar_image_url: imageUrl,
      });
    } catch (err) {
      console.error("uploadAadharImage error:", err);
      res.status(500).json({ message: "Failed to upload Aadhaar image" });
    }
  },
];

// ─── PUT /api/student/:id/aadhar-number ───────────────────────────────────────
// Save or update Aadhaar number only (for edits without re-uploading image)
const updateAadharNumber = async (req, res) => {
  try {
    const { aadhar_number } = req.body;

    if (!aadhar_number || !/^\d{12}$/.test(aadhar_number)) {
      return res.status(400).json({ message: "Valid 12-digit Aadhaar number is required" });
    }

    await pool.query(
      "UPDATE students SET aadhar_number = $1 WHERE id = $2",
      [aadhar_number, req.params.id]
    );

    res.json({ message: "Aadhaar number updated successfully" });
  } catch (err) {
    console.error("updateAadharNumber error:", err);
    res.status(500).json({ message: "Failed to update Aadhaar number" });
  }
};

module.exports = {
  getProfile,
  getAttendance,
  getResults,
  getFees,
  getAssignments,
  getTimetable,
  getTeachers,
  uploadAadharImage,   // ← NEW
  updateAadharNumber,  // ← NEW
};