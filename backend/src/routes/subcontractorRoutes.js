const express = require("express");
const {
  submitSubcontractorApplication,
  getMySubcontractorApplication
} = require("../controllers/subcontractorController");

const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();
router.get(
  "/my-application",
  requireAuth,
  getMySubcontractorApplication
);
router.post("/apply", submitSubcontractorApplication);

module.exports = router;
