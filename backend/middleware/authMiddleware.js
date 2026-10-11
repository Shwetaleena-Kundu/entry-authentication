const jwt = require("jsonwebtoken");
const pool = require("../db");

async function requireAuth(req, res, next) {
  const token = req.cookies.entry_token;

  function denyAccess() {
    if (req.path === "/dashboard.html") {
      return res.redirect("/index.html");
    }

    return res.status(401).json({
      message: "Please sign in again.",
    });
  }

  if (!token) return denyAccess();

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return denyAccess();
  }

  if (
    typeof payload.sub !== "string" ||
    typeof payload.sid !== "string"
  ) {
    return denyAccess();
  }

  try {
    const [rows] = await pool.execute(
      `SELECT users.id, users.username, users.email, users.created_at
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = ?
         AND sessions.user_id = ?
         AND sessions.expires_at > UTC_TIMESTAMP()`,
      [payload.sid, payload.sub]
    );

    if (!rows.length) return denyAccess();

    req.user = rows[0];
    req.sessionId = payload.sid;
    next();
  } catch (error) {
    console.error("Authentication failed:", error.message);

    return res.status(500).json({
      message: "Could not verify your session. Please try again.",
    });
  }
}

module.exports = requireAuth;