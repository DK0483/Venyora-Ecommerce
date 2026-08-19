const AuditLog = require("../models/auditLog");

const audit = async (req, action, targetType, targetId, metadata = {}) => {
  try {
    await AuditLog.create({ actor: req.user?.id, action, targetType, targetId: targetId?.toString(), ip: req.ip, metadata });
  } catch (error) { console.error("AUDIT LOG ERROR:", error.message); }
};

module.exports = audit;
