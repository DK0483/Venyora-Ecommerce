const { body, validationResult } = require("express-validator");

const failValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: "Invalid request data", errors: errors.array().map(e => ({ field: e.path, message: e.msg })) });
  next();
};

const cleanText = (field, label, { min = 1, max = 120 } = {}) => body(field)
  .trim().isLength({ min, max }).withMessage(`${label} must be ${min}-${max} characters`)
  .matches(/^[\p{L}\p{N}\s,.'#&()\-/]+$/u).withMessage(`${label} contains invalid characters`)
  .escape();

const email = (field = "email") => body(field).trim().isEmail().withMessage("Enter a valid email").normalizeEmail();
const password = body("password").isString().isLength({ min: 8, max: 72 }).withMessage("Password must be 8-72 characters").matches(/[a-z]/).withMessage("Password needs a lowercase letter").matches(/[A-Z]/).withMessage("Password needs an uppercase letter").matches(/\d/).withMessage("Password needs a number");

const addressValidators = [
  cleanText("fullName", "Full name", { min: 2, max: 80 }),
  body("mobile").trim().matches(/^\+?[1-9]\d{7,14}$/).withMessage("Enter a valid phone number"),
  cleanText("houseNumber", "House or flat", { min: 1, max: 100 }), cleanText("area", "Area", { min: 2, max: 100 }),
  body("landmark").optional({ checkFalsy: true }).trim().isLength({ max: 100 }).withMessage("Landmark is too long").escape(),
  cleanText("city", "City", { min: 2, max: 60 }), cleanText("state", "State", { min: 2, max: 60 }),
  body("pincode").trim().matches(/^\d{6}$/).withMessage("Enter a valid 6-digit pincode"),
  body("addressType").isIn(["Home", "Office"]).withMessage("Address type must be Home or Office"),
  body("isDefault").optional().isBoolean().toBoolean()
];

const shippingValidators = [
  cleanText("shippingInfo.fullName", "Full name", { min: 2, max: 80 }), cleanText("shippingInfo.address", "Address", { min: 5, max: 220 }),
  cleanText("shippingInfo.city", "City", { min: 2, max: 60 }), cleanText("shippingInfo.state", "State", { min: 2, max: 60 }),
  body("shippingInfo.zip").trim().matches(/^\d{6}$/).withMessage("Enter a valid 6-digit pincode"),
  body("shippingInfo.phone").trim().matches(/^\+?[1-9]\d{7,14}$/).withMessage("Enter a valid phone number"),
  body("paymentMethod").isIn(["cod", "online"]).withMessage("Invalid payment method")
];

module.exports = { failValidation, cleanText, email, password, addressValidators, shippingValidators };
