const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();


const authRoutes           = require("./routes/authRoutes");
const adminRoutes          = require("./routes/adminRoutes");
const studentRoutes        = require("./routes/studentRoutes");
const teacherRoutes        = require("./routes/teacherRoutes");
const timetableRoutes      = require("./routes/timetableRoutes");
const feesRoutes           = require("./routes/feesRoutes");        // ✅ ADD
const adminNoticesRoutes   = require("./routes/admin/notices");
const studentNoticesRoutes = require("./routes/student/notices");
const teacherNoticesRoutes = require("./routes/teacher/notices");
const homeworkRoutes = require("./routes/homeworkRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser()); 
app.get("/", (req, res) => res.json({ message: "EduERP API running ✅" }));

app.use("/api/admin/notices",   adminNoticesRoutes);
app.use("/api/student/notices", studentNoticesRoutes);
app.use("/api/teacher/notices", teacherNoticesRoutes);
app.use("/api/attendance", attendanceRoutes);



app.use("/api/auth",    authRoutes);
app.use("/api/admin",   adminRoutes);
app.use("/api/admin",   timetableRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/fees",    feesRoutes);                                // ✅ ADD
app.use("/api/homework", homeworkRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));