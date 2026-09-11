const express = require("express");

const {
  getSubcontractorApplications,
  reviewSubcontractorApplication
} = require("../controllers/subcontractorAdminController");

const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/", getSubcontractorApplications);

router.patch(
  "/:applicationId",
  reviewSubcontractorApplication
);

module.exports = router;
