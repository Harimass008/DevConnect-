const express = require("express");
const Review = require("../models/Review");
const Project = require("../models/Project");
const { authenticate, allowRoles } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const { reviewCode } = require("../services/openRouter");
const router = express.Router();

router.use(
  authenticate,
  allowRoles(
    "super_admin",
    "admin",
    "developer",
    "security_analyst",
    "reviewer",
  ),
);

router.get("/provider", (req, res) =>
  res.json({
    provider: "OpenRouter",
    model: process.env.OPENROUTER_MODEL || "openrouter/free",
    configured: Boolean(process.env.OPENROUTER_API_KEY),
    mode: "free-model-router",
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { code, language = "text", projectId } = req.body || {};
    if (typeof code !== "string" || !code.trim())
      return res.status(400).json({ message: "Code is required" });
    if (code.length > 40000)
      return res
        .status(413)
        .json({ message: "Code is too large; maximum 40,000 characters" });

    let project = null;
    if (projectId) {
      project = await Project.findById(projectId);
      if (!project)
        return res.status(404).json({ message: "Project not found" });
      const access =
        ["super_admin", "admin"].includes(req.user.role) ||
        project.owner.toString() === req.user._id.toString() ||
        project.members.some(
          (member) => member.toString() === req.user._id.toString(),
        );
      if (!access)
        return res
          .status(403)
          .json({ message: "You do not have access to this project" });
    }

    const result = await reviewCode({ code, language });
    const doc = await Review.create({
      user: req.user._id,
      project: project ? project._id : undefined,
      language: String(language).slice(0, 60),
      summary: result.summary,
      findings: result.findings,
    });
    res.json({
      reviewId: doc._id.toString(),
      summary: doc.summary,
      findings: doc.findings,
      provider: result.provider,
      model: result.model,
    });
  }),
);

module.exports = router;
