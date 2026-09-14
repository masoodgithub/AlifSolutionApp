const express = require("express");

const {
  requireAuth,
} = require("../middleware/authMiddleware");

const {
  uploadDocuments,
} = require("../middleware/upload");

const {
  uploadMyApplicationDocuments,
  getMyApplicationDocuments,
} = require("../controllers/documentController");

const router = express.Router();

router.get(
  "/my-application",
  requireAuth,
  getMyApplicationDocuments
);

router.post(
  "/my-application",
  requireAuth,
  uploadDocuments.array("documents", 10),
  uploadMyApplicationDocuments
);

module.exports = router;