const express = require("express");
const { param } = require("express-validator");
const Address = require("../models/address");
const authMiddleware = require("../middleware/authMiddleware");
const { failValidation, addressValidators } = require("../middleware/validators");
const audit = require("../utils/audit");
const router = express.Router();
const idValidator = param("id").isMongoId().withMessage("Invalid address id");
const fields = ["fullName", "mobile", "houseNumber", "area", "landmark", "city", "state", "pincode", "addressType", "isDefault"];

router.post("/", authMiddleware, [...addressValidators, failValidation], async (req, res, next) => {
  try {
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => fields.includes(key)));
    if (data.isDefault) await Address.updateMany({ user: req.user.id }, { $set: { isDefault: false } });
    const address = await Address.create({ ...data, user: req.user.id });
    await audit(req, "ADDRESS_CREATED", "Address", address._id);
    res.status(201).json(address);
  } catch (error) { next(error); }
});

router.get("/", authMiddleware, async (req, res, next) => { try { res.json(await Address.find({ user: req.user.id, isActive: true }).sort({ isDefault: -1, createdAt: -1 })); } catch (error) { next(error); } });

router.put("/:id", authMiddleware, [idValidator, ...addressValidators, failValidation], async (req, res, next) => {
  try {
    const data = Object.fromEntries(Object.entries(req.body).filter(([key]) => fields.includes(key)));
    if (data.isDefault) await Address.updateMany({ user: req.user.id, _id: { $ne: req.params.id } }, { $set: { isDefault: false } });
    const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user.id, isActive: true }, { $set: data }, { new: true, runValidators: true });
    if (!address) return res.status(404).json({ message: "Address not found" });
    await audit(req, "ADDRESS_UPDATED", "Address", address._id);
    res.json(address);
  } catch (error) { next(error); }
});

router.delete("/:id", authMiddleware, [idValidator, failValidation], async (req, res, next) => {
  try { const address = await Address.findOneAndUpdate({ _id: req.params.id, user: req.user.id, isActive: true }, { $set: { isActive: false } }, { new: true }); if (!address) return res.status(404).json({ message: "Address not found" }); await audit(req, "ADDRESS_REMOVED", "Address", address._id); res.json({ message: "Address removed" }); } catch (error) { next(error); }
});

module.exports = router;
