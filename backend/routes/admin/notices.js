// routes/admin/notices.js

const express = require("express");
const router  = express.Router();
const { protect, authorizeRoles } = require("../../middleware/authMiddleware");

const {
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../../controllers/admin/noticesController");

router.use(protect, authorizeRoles("admin"));

router.get(   "/",    getAllNotices);
router.post(  "/",    createNotice);
router.put(   "/:id", updateNotice);
router.delete("/:id", deleteNotice);

module.exports = router;