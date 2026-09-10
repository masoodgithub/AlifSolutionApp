const express = require("express");
const { loginUser } = require("../controllers/authController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/login", loginUser);

router.get("/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});
router.get(
  "/admin-test",
  requireAuth,
  requireRole("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted."
    });
  }
);

module.exports = router;