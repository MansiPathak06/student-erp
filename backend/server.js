const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const authRoutes      = require("./routes/authRoutes");
const adminRoutes     = require("./routes/adminRoutes");
const studentRoutes   = require("./routes/studentRoutes");
const teacherRoutes   = require("./routes/teacherRoutes");
const timetableRoutes = require("./routes/timetableRoutes");

// ✅ Pehle app banao
const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/", (req, res) => res.json({ message: "EduERP API running ✅" }));

// ✅ Routes - sab saath mein, sahi order mein
app.use("/api/auth",    authRoutes);
app.use("/api/admin",   adminRoutes);
app.use("/api/admin",   timetableRoutes);  // ✅ Yahan move kiya
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 EduERP server running on http://localhost:${PORT}`));