const express = require("express");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { authenticate } = require("../middleware/auth");
const { sendSMS } = require("../services/sms");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();
router.use(authenticate);
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Try again later." },
});
router.get(
  "/preferences",
  asyncHandler(async (req, res) => {
    const p = req.user.notificationPreferences.toObject
      ? req.user.notificationPreferences.toObject()
      : req.user.notificationPreferences;
    res.json({ preferences: { ...p, phone: req.user.phone || "" } });
  }),
);
router.patch(
  "/preferences",
  asyncHandler(async (req, res) => {
    const allowed = [
      "emailEnabled",
      "smsEnabled",
      "projectUpdates",
      "securityAlerts",
      "teamMessages",
    ];
    const body = req.body || {};
    for (const key of allowed)
      if (body[key] !== undefined) {
        if (typeof body[key] !== "boolean")
          return res
            .status(400)
            .json({ message: `${key} must be true or false` });
        req.user.notificationPreferences[key] = body[key];
      }
    if (body.phone !== undefined) {
      if (
        typeof body.phone !== "string" ||
        (body.phone && !/^\+[1-9]\d{7,14}$/.test(body.phone.trim()))
      )
        return res.status(400).json({
          message: "Phone must be in international format, e.g. +919876543210",
        });
      const next = body.phone.trim();
      if (next !== req.user.phone) {
        req.user.phone = next;
        req.user.phoneVerified = false;
        req.user.notificationPreferences.smsEnabled = false;
      }
    }
    if (req.user.notificationPreferences.smsEnabled && !req.user.phoneVerified)
      return res.status(400).json({
        message: "Verify your phone number before enabling SMS notifications",
      });
    await req.user.save();
    const p = req.user.notificationPreferences.toObject
      ? req.user.notificationPreferences.toObject()
      : req.user.notificationPreferences;
    res.json({ preferences: { ...p, phone: req.user.phone || "" } });
  }),
);
router.post(
  "/phone/send-otp",
  otpLimiter,
  asyncHandler(async (req, res) => {
    const phone =
      typeof req.body?.phone === "string" ? req.body.phone.trim() : "";
    if (!/^\+[1-9]\d{7,14}$/.test(phone))
      return res.status(400).json({
        message: "Enter a valid phone number in international format",
      });
    if (
      req.user.phoneOtpLastSentAt &&
      Date.now() - req.user.phoneOtpLastSentAt.getTime() < 60 * 1000
    )
      return res
        .status(429)
        .json({ message: "Wait 60 seconds before requesting another code" });
    const otp = String(crypto.randomInt(100000, 1000000));
    req.user.phone = phone;
    req.user.phoneVerified = false;
    req.user.notificationPreferences.smsEnabled = false;
    req.user.phoneOtpHash = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");
    req.user.phoneOtpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    req.user.phoneOtpLastSentAt = new Date();
    await req.user.save();
    try {
      await sendSMS(
        phone,
        `Your DevConnect verification code is ${otp}. It expires in 5 minutes.`,
      );
    } catch (e) {
      req.user.phoneOtpHash = undefined;
      req.user.phoneOtpExpiresAt = undefined;
      await req.user.save();
      console.error("SMS delivery failed:", e.message);
      return res.status(503).json({
        message: "SMS delivery is not configured or is temporarily unavailable",
      });
    }
    res.json({ message: "Verification code sent. It expires in 5 minutes." });
  }),
);
router.post(
  "/phone/verify-otp",
  otpLimiter,
  asyncHandler(async (req, res) => {
    const { phone, otp } = req.body || {};
    if (
      phone !== req.user.phone ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    )
      return res.status(400).json({ message: "Invalid phone number or OTP" });
    if (
      !req.user.phoneOtpHash ||
      !req.user.phoneOtpExpiresAt ||
      req.user.phoneOtpExpiresAt < new Date()
    )
      return res.status(400).json({ message: "OTP is invalid or expired" });
    const hash = crypto.createHash("sha256").update(otp).digest("hex");
    if (hash !== req.user.phoneOtpHash)
      return res.status(400).json({ message: "Incorrect verification code" });
    req.user.phoneVerified = true;
    req.user.phoneOtpHash = undefined;
    req.user.phoneOtpExpiresAt = undefined;
    await req.user.save();
    res.json({ message: "Phone number verified", phoneVerified: true });
  }),
);
module.exports = router;
