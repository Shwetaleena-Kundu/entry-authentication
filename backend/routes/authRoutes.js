const express = require("express");
const { rateLimit } = require("express-rate-limit");
const { register, login } = require("../controllers/authController.js");
const requireAuth = require("../middleware/authMiddleware");
const pool = require("../db");

const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many registration attempts. Please try again later.",
  },
});

router.post("/register", registerLimiter, register);
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later.",
  },
});

router.post("/login", loginLimiter, login);
router.get("/me", requireAuth, (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ user: req.user });
});

router.post("/logout", requireAuth, async (req, res) => {
  try {
    await pool.execute(
      "DELETE FROM sessions WHERE id = ?",
      [req.sessionId]
    );

    res.clearCookie("entry_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    res.json({ message: "Signed out successfully." });
  } catch (error) {
    console.error("Logout failed:", error.message);

    res.status(500).json({
      message: "Could not sign out. Please try again.",
    });
  }
});
module.exports = router;