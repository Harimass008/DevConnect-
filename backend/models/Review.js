const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  language: { type: String, default: "text" },
  summary: { type: String, default: "" },
  findings: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("Review", schema);
