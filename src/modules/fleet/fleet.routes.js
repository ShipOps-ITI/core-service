const express = require("express");
const router = express.Router();

const controller = require("./fleet.controller");
const validate = require("../../middleware/validate");
const authorize = require("../../middleware/authorize");
const { requireCompanyMembership } = require("../../middleware/companyScope");

const {
  createFleetSchema,
  updateFleetSchema,
} = require("./fleet.validation");

// Get all fleets
router.get("/", authorize("ADMIN", "COMPANY_ADMIN", "FLEET_MANAGER"), requireCompanyMembership, controller.getAllFleets);

// Get fleets for a specific company
router.get("/company/:companyId", authorize("ADMIN", "COMPANY_ADMIN", "FLEET_MANAGER"), requireCompanyMembership, controller.getFleetsByCompany);

// Get fleet by ID
router.get("/:id", authorize("ADMIN", "COMPANY_ADMIN", "FLEET_MANAGER"), requireCompanyMembership, controller.getFleetById);

// Create fleet
router.post(
  "/",
  authorize("ADMIN", "COMPANY_ADMIN"),
  requireCompanyMembership,
  validate(createFleetSchema),
  controller.createFleet
);

// Update fleet
router.put(
  "/:id",
  authorize("ADMIN", "COMPANY_ADMIN", "FLEET_MANAGER"),
  requireCompanyMembership,
  validate(updateFleetSchema),
  controller.updateFleet
);

// Delete fleet
router.delete("/:id", authorize("ADMIN", "COMPANY_ADMIN"), requireCompanyMembership, controller.deleteFleet);

module.exports = router;
