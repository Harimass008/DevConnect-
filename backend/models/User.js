const mongoose = require("mongoose");
const ROLES = [
  "super_admin",
  "admin",
  "project_manager",
  "developer",
  "security_analyst",
  "reviewer",
  "user",
  "viewer",
];
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "user", index: true },
    phone: { type: String, default: "" },
    phoneVerified: { type: Boolean, default: false },
    notificationPreferences: {
      emailEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: false },
      projectUpdates: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      teamMessages: { type: Boolean, default: true },
    },
    resetTokenHash: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },
    phoneOtpHash: { type: String, select: false },
    phoneOtpExpiresAt: { type: Date, select: false },
    phoneOtpLastSentAt: { type: Date, select: false },
    lastLoginAt: Date,
  },
  { timestamps: true },
);
userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone || "",
    phoneVerified: !!this.phoneVerified,
    notificationPreferences: this.notificationPreferences,
    createdAt: this.createdAt,
  };
};
module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
