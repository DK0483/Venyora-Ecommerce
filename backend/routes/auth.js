const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const User = require("../models/user");
const authMiddleware = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiters");
const { failValidation, cleanText, email, password } = require("../middleware/validators");
const audit = require("../utils/audit");
const router = express.Router();

router.post("/register", authLimiter, [cleanText("name", "Name", { min: 2, max: 80 }), email(), password, failValidation], async (req, res, next) => {
  try {
    const { name, email: userEmail, password: rawPassword } = req.body;
    if (await User.exists({ email: userEmail })) return res.status(409).json({ message: "An account with this email already exists" });
    const user = await User.create({ name, email: userEmail, password: await bcrypt.hash(rawPassword, 12) });
    await audit(req, "USER_REGISTERED", "User", user._id, { email: user.email });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) { next(error); }
});

router.post("/login", authLimiter, [email(), body("password").isString().isLength({ min: 1, max: 72 }).withMessage("Invalid credentials"), failValidation], async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ message: "Invalid email or password" });
    const token = jwt.sign({ user: { id: user.id, role: user.role } }, process.env.JWT_SECRET, { expiresIn: "7d", issuer: "venyora-api", audience: "venyora-web" });
    await audit({ ...req, user: { id: user.id } }, "USER_LOGGED_IN", "User", user._id);
    res.json({ token });
  } catch (error) { next(error); }
});

router.get("/user", authMiddleware, async (req, res, next) => { try { const user = await User.findById(req.user.id).select("-password"); if (!user) return res.status(404).json({ message: "User not found" }); res.json(user); } catch (error) { next(error); } });

router.put("/update-profile", authMiddleware, [cleanText("name", "Name", { min: 2, max: 80 }).optional(), email().optional(), body("gender").optional().isIn(["male", "female", "other", "prefer_not_to_say"]), body("mobile").optional().matches(/^\+?[1-9]\d{7,14}$/), body("age").optional().isInt({ min: 13, max: 120 }).toInt(), failValidation], async (req, res, next) => {
  try {
    const allowed = ["name", "email", "gender", "mobile", "age"];
    const update = Object.fromEntries(Object.entries(req.body).filter(([key, value]) => allowed.includes(key) && value !== undefined));
    if (update.email && await User.exists({ email: update.email, _id: { $ne: req.user.id } })) return res.status(409).json({ message: "Email already in use" });
    const user = await User.findByIdAndUpdate(req.user.id, { $set: update }, { new: true, runValidators: true }).select("-password");
    await audit(req, "PROFILE_UPDATED", "User", req.user.id, { fields: Object.keys(update) });
    res.json({ message: "Profile updated successfully", user });
  } catch (error) { next(error); }
});

module.exports = router;
