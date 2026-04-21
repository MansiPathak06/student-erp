// routes/feesRoutes.js
const express = require("express");
const router  = express.Router();
const fees    = require("../controllers/feesController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect); // verifyToken → protect

// ── Fee Structures (Admin sets per-class fees) ────────────────────────────────
router.get ("/structures",     authorizeRoles("admin", "teacher"), fees.getAllStructures);
router.post("/structures",     authorizeRoles("admin"),            fees.upsertStructure);   // saves + bulk-creates student records
router.delete("/structures/:id", authorizeRoles("admin"),          fees.deleteStructure);

// ── Analytics ─────────────────────────────────────────────────────────────────
router.get("/stats", authorizeRoles("admin", "teacher"), fees.getStats);
router.get("/student/fees", authorizeRoles("student"), fees.getMyFees);



// ── Student Fee Records ───────────────────────────────────────────────────────
router.get   ("/students",     authorizeRoles("admin", "teacher"), fees.getStudentFees);
router.get   ("/students/:id", authorizeRoles("admin", "teacher"), fees.getStudentFeeById);
router.patch ("/students/:id", authorizeRoles("admin", "teacher"), fees.updateStudentFee);  // both can update
router.delete("/students/:id", authorizeRoles("admin"),            fees.deleteStudentFee);

module.exports = router;