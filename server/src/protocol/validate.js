// src/protocol/validate.js
function isNonEmptyString(x) {
  return typeof x === "string" && x.trim().length > 0;
}

function validateJoin(payload) {
  if (!payload || typeof payload !== "object") return "Invalid payload";
  if (!isNonEmptyString(payload.room)) return "room is required";
  if (!isNonEmptyString(payload.name)) return "name is required";
  return null;
}

function validateRoomOnly(payload) {
  if (!payload || typeof payload !== "object") return "Invalid payload";
  if (!isNonEmptyString(payload.room)) return "room is required";
  return null;
}

module.exports = {
  validateJoin,
  validateRoomOnly,
};
