const bcrypt = require("bcrypt");
const pool = require("../db");
const jwt = require("jsonwebtoken");
const { randomUUID } = require("crypto");
async function register(req, res) {
  const { username, email, password } = req.body || {};

  // Check types before using string methods.
  if (
    typeof username !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return res.status(400).json({
      message: "Username, email, and password are required.",
    });
  }

  const cleanUsername = username.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!/^[A-Za-z0-9_]{3,30}$/.test(cleanUsername)) {
    return res.status(400).json({
      message: "Username must contain 3–30 letters, numbers, or underscores.",
    });
  }

  if (
    cleanEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
  ) {
    return res.status(400).json({
      message: "Enter a valid email address.",
    });
  }

  // bcrypt supports passwords up to 72 bytes.
  // Keep the password exactly as entered; do not trim it.
  if (
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      message: "Password must have at least 8 characters and be at most 72 bytes.",
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    await pool.execute(
      `INSERT INTO users (username, email, password_hash)
       VALUES (?, ?, ?)`,
      [cleanUsername, cleanEmail, passwordHash]
    );

    return res.status(201).json({
      message: "Account created successfully. You can now sign in.",
    });
  } catch (error) {
    // UNIQUE constraints also prevent simultaneous duplicate registrations.
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "That username or email is already registered.",
      });
    }

    console.error("Registration failed:", error.code);

    return res.status(500).json({
      message: "Could not create your account. Please try again.",
    });
  }
}
async function login(req, res) {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password ||
    email.trim().length > 254 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      message: "Enter a valid email and password.",
    });
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing.");
    }

    const [users] = await pool.execute(
      "SELECT id, password_hash FROM users WHERE email = ?",
      [email.trim().toLowerCase()]
    );

    const user = users[0];

    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    const matches = await bcrypt.compare(password, user.password_hash);

    if (!matches) {
      return res.status(401).json({
        message: "Incorrect email or password.",
      });
    }

    const sessionId = randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const token = jwt.sign(
      { sid: sessionId },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        subject: String(user.id),
        expiresIn: "1h",
      }
    );

    await pool.execute(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)",
      [sessionId, user.id, expiresAt]
    );

    res.cookie("entry_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    return res.json({
      message: "Signed in successfully.",
    });
  } catch (error) {
    console.error("Login failed:", error.message);

    return res.status(500).json({
      message: "Could not sign in. Please try again.",
    });
  }
}
module.exports = { register, login };