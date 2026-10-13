const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { authenticate } = require("../middleware/auth");
const { sendEmail } = require("../services/mailer");
const { sendSMS } = require("../services/sms");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Try again later." },
});
const signToken = (user) =>
  jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
const validEmail = (s) => typeof s === "string" && /^\S+@\S+\.\S+$/.test(s);
router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};
    if (
      !name ||
      !validEmail(email) ||
      typeof password !== "string" ||
      password.length < 8
    )
      return res
        .status(400)
        .json({
          message:
            "Name, valid email and password (at least 8 characters) are required",
        });
    const normalized = email.toLowerCase().trim();
    if (await User.exists({ email: normalized }))
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    const user = await User.create({
      name: name.trim(),
      email: normalized,
      passwordHash: await bcrypt.hash(password, 12),
      role: "user",
    });
    try {
      if (user.notificationPreferences.emailEnabled)
        await sendEmail({
          to: user.email,
          subject: "Welcome to DevConnect",
          text: `Welcome ${user.name}! Your DevConnect account is ready.`,
        });
    } catch (e) {
      console.error("Welcome email failed:", e.message);
    }
    res.status(201).json({ token: signToken(user), user: user.toSafeJSON() });
  }),
);
router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!validEmail(email) || typeof password !== "string")
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+passwordHash");
    if (!user || !(await bcrypt.compare(password, user.passwordHash)))
      return res.status(401).json({ message: "Invalid email or password" });
    user.lastLoginAt = new Date();
    await user.save();
    res.json({ token: signToken(user), user: user.toSafeJSON() });
  }),
);
router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => res.json({ user: req.user.toSafeJSON() })),
);
router.patch(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const { name, email } = req.body || {};
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim())
        return res.status(400).json({ message: "Name cannot be empty" });
      req.user.name = name.trim();
    }
    if (email !== undefined) {
      if (!validEmail(email))
        return res.status(400).json({ message: "Valid email is required" });
      const normalized = email.toLowerCase().trim();
      const exists = await User.exists({
        email: normalized,
        _id: { $ne: req.user._id },
      });
      if (exists)
        return res.status(409).json({ message: "Email is already in use" });
      req.user.email = normalized;
    }
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  }),
);
router.post(
  "/change-password",
  authenticate,
  authLimiter,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    )
      return res
        .status(400)
        .json({
          message:
            "Current password, new password and confirmation are required",
        });
    if (newPassword.length < 8)
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters" });
    if (newPassword !== confirmPassword)
      return res
        .status(400)
        .json({ message: "New password and confirmation do not match" });
    const user = await User.findById(req.user._id).select("+passwordHash");
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash)))
      return res.status(400).json({ message: "Current password is incorrect" });
    if (await bcrypt.compare(newPassword, user.passwordHash))
      return res
        .status(400)
        .json({
          message: "New password must be different from the current password",
        });
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    try {
      if (
        user.notificationPreferences?.emailEnabled &&
        user.notificationPreferences?.securityAlerts
      )
        await sendEmail({
          to: user.email,
          subject: "DevConnect password changed",
          text: "Your DevConnect password was changed successfully. If this was not you, reset your password immediately.",
        });
    } catch (e) {
      console.error("Password-change notification failed:", e.message);
    }
    res.json({
      message:
        "Password updated successfully. A security notification was sent if email is configured.",
    });
  }),
);
router.post(
  "/logout",
  authenticate,
  asyncHandler(async (req, res) =>
    res.json({ message: "Logged out. Remove the bearer token on the client." }),
  ),
);
router.post(
  "/forgot-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.toLowerCase().trim()
        : "";
    const user = await User.findOne({ email }).select(
      "+resetTokenHash +resetTokenExpiresAt",
    );
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetTokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
      user.resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
      await user.save();
      const link = `${(process.env.APP_BASE_URL || "http://localhost:5173").replace(/\/$/, "")}/?token=${token}`;
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your DevConnect password",
          text: `Use this link within 30 minutes to reset your password: ${link}\nIf you did not request this, ignore this email.`,
        });
      } catch (e) {
        console.error("Password reset email failed:", e.message);
        if (process.env.NODE_ENV !== "production")
          console.log("[DEV RESET LINK]", link);
      }
    }
    res.json({
      message:
        "If an account exists, password-reset instructions have been sent.",
    });
  }),
);
router.post(
  "/reset-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { token, password, confirmPassword } = req.body || {};
    if (
      typeof token !== "string" ||
      typeof password !== "string" ||
      password.length < 8
    )
      return res
        .status(400)
        .json({
          message:
            "A reset token and password of at least 8 characters are required",
        });
    if (confirmPassword !== undefined && password !== confirmPassword)
      return res
        .status(400)
        .json({ message: "New password and confirmation do not match" });
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetTokenHash: hash,
      resetTokenExpiresAt: { $gt: new Date() },
    }).select("+resetTokenHash +resetTokenExpiresAt +passwordHash");
    if (!user)
      return res
        .status(400)
        .json({ message: "Reset link is invalid or expired" });
    user.passwordHash = await bcrypt.hash(password, 12);
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();
    try {
      if (
        user.notificationPreferences.securityAlerts &&
        user.notificationPreferences.emailEnabled
      )
        await sendEmail({
          to: user.email,
          subject: "DevConnect password changed",
          text: "Your DevConnect password was changed. If this was not you, contact support immediately.",
        });
    } catch (e) {
      console.error("Security notification failed:", e.message);
    }
    res.json({ message: "Password reset successfully. You can now sign in." });
  }),
);
module.exports = router;
