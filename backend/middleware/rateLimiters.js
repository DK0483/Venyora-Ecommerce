const rateLimit = require("express-rate-limit");

const jsonLimit = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { message }
});

module.exports = {
  authLimiter: jsonLimit(15 * 60 * 1000, 10, "Too many attempts. Please try again in 15 minutes."),
  contactLimiter: jsonLimit(60 * 60 * 1000, 5, "Too many messages. Please try again later."),
  checkoutLimiter: jsonLimit(15 * 60 * 1000, 20, "Too many checkout attempts. Please try again shortly.")
};
