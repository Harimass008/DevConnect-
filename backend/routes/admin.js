const express = require("express");
const User = require("../models/User");
const Project = require("../models/Project");
const Review = require("../models/Review");
const { authenticate, allowRoles } = require("../middleware/auth");
const { ROLES } = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();
router.use(authenticate);
router.get(
  "/users",
  allowRoles("super_admin", "admin", "project_manager"),
  asyncHandler(async (req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users: users.map((u) => u.toSafeJSON()) });
  }),
);
router.patch(
  "/users/:id/role",
  allowRoles("super_admin", "admin"),
  asyncHandler(async (req, res) => {
    const { role } = req.body || {};
    if (!ROLES.includes(role))
      return res.status(400).json({ message: "Invalid role" });
    if (req.params.id === req.user._id.toString() && role !== req.user.role)
      return res
        .status(400)
        .json({ message: "You cannot change your own role" });
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: "User not found" });
    if (req.user.role !== "super_admin" && target.role === "super_admin")
      return res
        .status(403)
        .json({ message: "Only a super admin can modify another super admin" });
    if (req.user.role !== "super_admin" && role === "super_admin")
      return res
        .status(403)
        .json({
          message: "Only a super admin can assign the super_admin role",
        });
    target.role = role;
    await target.save();
    console.log(
      `[AUDIT] role changed by ${req.user.email}: ${target.email} -> ${role}`,
    );
    res.json({ user: target.toSafeJSON() });
  }),
);
router.get(
  "/stats",
  allowRoles("super_admin", "admin"),
  asyncHandler(async (req, res) => {
    const [users, projects, reviews] = await Promise.all([
      User.countDocuments(),
      Project.countDocuments(),
      Review.countDocuments(),
    ]);
    res.json({ stats: { users, projects, reviews } });
  }),
);
module.exports = router;
