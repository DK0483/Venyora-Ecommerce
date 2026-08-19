const express = require("express");
const { body } = require("express-validator");
const Message = require("../models/message");
const { contactLimiter } = require("../middleware/rateLimiters");
const { failValidation, cleanText, email } = require("../middleware/validators");
const audit = require("../utils/audit");
const router = express.Router();

router.post("/", contactLimiter, [cleanText("name", "Name", { min: 2, max: 80 }), email(), body("subject").optional().trim().isLength({ max: 120 }).escape(), body("message").trim().isLength({ min: 10, max: 2000 }).withMessage("Message must be 10-2000 characters").escape(), failValidation], async (req, res, next) => {
  try {
    const message = await Message.create({ name: req.body.name, email: req.body.email, subject: req.body.subject || "General Question", message: req.body.message });
    await audit(req, "CONTACT_MESSAGE_CREATED", "Message", message._id);
    res.status(201).json({ msg: "Message received! Thank you." });
  } catch (error) { next(error); }
});

module.exports = router;
