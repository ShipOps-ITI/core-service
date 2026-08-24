const express = require("express");
const authorize = require("../../middleware/authorize");
const { requireCompanyMembership } = require("../../middleware/companyScope");
const controller = require("./tracking.controller");

const router = express.Router();
router.get("/health", authorize("ADMIN", "COMPANY_ADMIN", "FLEET_MANAGER"), requireCompanyMembership, controller.getTrackingHealth);

module.exports = router;
