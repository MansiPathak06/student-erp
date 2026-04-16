// ── timetableRoutes.js
// Add this file to your routes/ folder
// Then in server.js add:
//   const timetableRoutes = require("./routes/timetableRoutes");
//   app.use("/api/admin", timetableRoutes);

const express = require("express");
const router  = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getTimetable,
  createPeriod,
  updatePeriod,
  deletePeriod,
} = require("../controllers/timetableController");

router.use(protect, authorizeRoles("admin"));

router.get   ("/timetable",     getTimetable);
router.post  ("/timetable",     createPeriod);
router.put   ("/timetable/:id", updatePeriod);
router.delete("/timetable/:id", deletePeriod);

module.exports = router;