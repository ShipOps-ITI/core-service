const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5001/auth";

const verifyFleetManager = async (userId, companyId, authorization) => {
  const response = await fetch(`${AUTH_SERVICE_URL}/users/${userId}`, {
    headers: { Authorization: authorization },
  });

  if (response.status === 404) return { valid: false, message: "Fleet Manager account was not found." };
  if (response.status === 401 || response.status === 403) {
    return { valid: false, message: "You cannot assign a user outside this company." };
  }
  if (!response.ok) return { valid: false, message: "Could not validate the selected Fleet Manager." };

  const user = await response.json();
  if (user.role !== "FLEET_MANAGER" || Number(user.companyId) !== Number(companyId) || !user.isActive) {
    return { valid: false, message: "Select an active Fleet Manager from this company." };
  }

  return { valid: true, user };
};

module.exports = { verifyFleetManager };
