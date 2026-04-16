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

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "EduERP API running ✅" }));

// ✅ Sab routes yahan
app.use("/api/auth",    authRoutes);
app.use("/api/admin",   adminRoutes);
app.use("/api/admin",   timetableRoutes); // ✅ sahi jagah
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));