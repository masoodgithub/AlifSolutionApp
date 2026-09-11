const express = require("express");
const {
  submitSubcontractorApplication
} = require("../controllers/subcontractorController");

const router = express.Router();

router.post("/apply", submitSubcontractorApplication);

module.exports = router;
