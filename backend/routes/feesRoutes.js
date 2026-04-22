// routes/feesRoutes.js  — FIXED

const express = require("express");
const router  = express.Router();
const fees    = require("../controllers/feesController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.use(protect);

// ── Fee Structures ───────────────────────────────────────────────────────────
router.get   ("/structures",     authorizeRoles("admin", "teacher"), fees.getAllStructures);
router.post  ("/structures",     authorizeRoles("admin"),            fees.upsertStructure);
router.delete("/structures/:id", authorizeRoles("admin"),            fees.deleteStructure);

// ── Analytics ────────────────────────────────────────────────────────────────
router.get("/stats",             authorizeRoles("admin", "teacher"), fees.getStats);

// ── Student's OWN fees  ← MUST be before /students/:id ──────────────────────
router.get("/student/fees",      authorizeRoles("student"),          fees.getMyFees);

// ── Student Fee Records (admin + teacher) ────────────────────────────────────
router.get   ("/students",       authorizeRoles("admin", "teacher"), fees.getStudentFees);
router.get   ("/students/:id",   authorizeRoles("admin", "teacher"), fees.getStudentFeeById);
router.patch ("/students/:id",   authorizeRoles("admin", "teacher"), fees.updateStudentFee);
router.delete("/students/:id",   authorizeRoles("admin"),            fees.deleteStudentFee);

module.exports = router;