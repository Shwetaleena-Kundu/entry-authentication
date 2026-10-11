const express = require("express");
const path = require("path");
const pool = require("./db");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const requireAuth = require("./middleware/authMiddleware");

const app = express();
const PORT = Number(process.env.PORT || 5001);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    message: "Entry backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.get("/dashboard.html", requireAuth, (req, res, next) => {
  res.set("Cache-Control", "no-store");

  res.sendFile(
    path.join(__dirname, "../frontend/dashboard.html"),
    (error) => {
      if (error) next(error);
    }
  );
});
app.use(express.static(path.join(__dirname, "../frontend")));

app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON request.",
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request is too large.",
    });
  }

  console.error("Request failed:", error.message);

  res.status(500).json({
    message: "Something went wrong. Please try again.",
  });
});

async function startServer() {
  try {
    await pool.query("SELECT 1");

    console.log("MySQL connected successfully");

    app.listen(PORT, () => {
      console.log(`Entry server: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    await pool.end();
    process.exitCode = 1;
  }
}

startServer();