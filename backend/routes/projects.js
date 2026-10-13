const express = require("express");
const Project = require("../models/Project");
const Message = require("../models/Message");
const { authenticate, allowRoles } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const router = express.Router();
router.use(authenticate);
const idValid = (id) => /^[a-f\d]{24}$/i.test(String(id));
function canAccess(project, user) {
  return (
    ["super_admin", "admin"].includes(user.role) ||
    project.owner.toString() === user._id.toString() ||
    project.members.some((x) => x.toString() === user._id.toString())
  );
}
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = ["super_admin", "admin", "project_manager"].includes(
      req.user.role,
    )
      ? {}
      : { $or: [{ owner: req.user._id }, { members: req.user._id }] };
    const projects = await Project.find(filter)
      .sort({ updatedAt: -1 })
      .populate("owner", "name email")
      .lean();
    res.json({
      projects: projects.map((p) => ({
        ...p,
        id: p._id.toString(),
        ownerName: p.owner?.name,
      })),
    });
  }),
);
router.post(
  "/",
  allowRoles("super_admin", "admin", "project_manager", "developer"),
  asyncHandler(async (req, res) => {
    const { name, description = "", language = "JavaScript" } = req.body || {};
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string"
    )
      return res
        .status(400)
        .json({ message: "Project name and description are required" });
    const project = await Project.create({
      name: name.trim(),
      description,
      language,
      owner: req.user._id,
      createdBy: req.user._id,
      members: [req.user._id],
    });
    res
      .status(201)
      .json({ project: { ...project.toObject(), id: project._id.toString() } });
  }),
);
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!idValid(req.params.id))
      return res.status(400).json({ message: "Invalid project id" });
    const p = await Project.findById(req.params.id).populate(
      "owner",
      "name email",
    );
    if (!p) return res.status(404).json({ message: "Project not found" });
    if (!canAccess(p, req.user))
      return res
        .status(403)
        .json({ message: "You do not have access to this project" });
    res.json({ project: { ...p.toObject(), id: p._id.toString() } });
  }),
);
router.get(
  "/:id/messages",
  asyncHandler(async (req, res) => {
    if (!idValid(req.params.id))
      return res.status(400).json({ message: "Invalid project id" });
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Project not found" });
    if (!canAccess(p, req.user))
      return res
        .status(403)
        .json({ message: "You do not have access to this project" });
    const messages = await Message.find({ project: p._id })
      .sort({ createdAt: 1 })
      .populate("sender", "name email")
      .lean();
    res.json({
      messages: messages.map((m) => ({
        ...m,
        id: m._id.toString(),
        senderName: m.sender?.name,
        senderEmail: m.sender?.email,
      })),
    });
  }),
);
router.post(
  "/:id/messages",
  allowRoles(
    "super_admin",
    "admin",
    "project_manager",
    "developer",
    "security_analyst",
    "reviewer",
  ),
  asyncHandler(async (req, res) => {
    if (!idValid(req.params.id))
      return res.status(400).json({ message: "Invalid project id" });
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Project not found" });
    if (!canAccess(p, req.user))
      return res
        .status(403)
        .json({ message: "You do not have access to this project" });
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text || text.length > 5000)
      return res
        .status(400)
        .json({ message: "Message must be between 1 and 5000 characters" });
    const m = await Message.create({
      project: p._id,
      sender: req.user._id,
      text,
    });
    res.status(201).json({
      message: {
        ...m.toObject(),
        id: m._id.toString(),
        senderName: req.user.name,
        senderEmail: req.user.email,
      },
    });
  }),
);
module.exports = router;
