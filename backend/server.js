require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const notificationRoutes = require("./routes/notifications");
const adminRoutes = require("./routes/admin");
const reviewRoutes = require("./routes/reviews");
const app = express();
app.disable("x-powered-by");
app.use(helmet());
const origins = (process.env.CLIENT_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((x) => x.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || origins.includes(origin)) return cb(null, true);
      return cb(new Error("Origin not allowed by CORS"));
    },
    credentials: false,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    limit: 180,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.get("/api/health", (req, res) =>
  res.json({
    status: "ok",
    service: "DevConnect API",
    time: new Date().toISOString(),
  }),
);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use((req, res) => res.status(404).json({ message: "API route not found" }));
app.use((err, req, res, next) => {
  console.error(err.stack || err);
  if (res.headersSent) return next(err);
  res
    .status(err.status || 500)
    .json({
      message:
        process.env.NODE_ENV === "production"
          ? "Server error"
          : err.message || "Server error",
    });
});
async function bootstrapAdmin() {
  if (process.env.NODE_ENV !== "development") return;
  const email = (process.env.ADMIN_EMAIL || "admin@devconnect.local")
    .toLowerCase()
    .trim();
  if (await User.exists({ role: { $in: ["admin", "super_admin"] } })) return;
  if (!process.env.ADMIN_PASSWORD) return;
  const password = process.env.ADMIN_PASSWORD;
  if (password.length < 8) {
    console.warn(
      "Skipping automatic demo admin creation: ADMIN_PASSWORD must be at least 8 characters. Set a stronger password before deployment.",
    );
    return;
  }
  await User.create({
    name: process.env.ADMIN_NAME || "DevConnect Admin",
    email,
    passwordHash: await bcrypt.hash(password, 12),
    role: "super_admin",
  });
  console.log(`Development admin created: ${email}`);
}
const port = Number(process.env.PORT || 5000);
connectDB()
  .then(bootstrapAdmin)
  .then(() =>
    app.listen(port, () =>
      console.log(`DevConnect API listening on http://localhost:${port}`),
    ),
  )
  .catch((err) => {
    console.error("Startup failed:", err.message);
    process.exit(1);
  });
