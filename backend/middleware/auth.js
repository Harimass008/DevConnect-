const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const authenticate = asyncHandler(async (req, res, next) => {
  const value = req.headers.authorization || "";
  if (!value.startsWith("Bearer "))
    return res.status(401).json({ message: "Authentication required" });
  let payload;
  try {
    payload = jwt.verify(value.slice(7), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
  const user = await User.findById(payload.sub);
  if (!user) return res.status(401).json({ message: "Account not found" });
  req.user = user;
  next();
});
const allowRoles =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res
          .status(403)
          .json({
            message: "You do not have permission to perform this action",
          });
const isAdmin = allowRoles("super_admin", "admin");
module.exports = { authenticate, allowRoles, isAdmin };
