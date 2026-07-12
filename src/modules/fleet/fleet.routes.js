const express = require("express");
const router = express.Router();

const controller = require("./fleet.controller");
const validate = require("../../middleware/validate");

const {
  createFleetSchema,
  updateFleetSchema,
} = require("./fleet.validation");

// Get all fleets
router.get("/", controller.getAllFleets);

// Get fleets for a specific company
router.get("/company/:companyId", controller.getFleetsByCompany);

// Get fleet by ID
router.get("/:id", controller.getFleetById);

// Create fleet
router.post(
  "/",
  validate(createFleetSchema),
  controller.createFleet
);

// Update fleet
router.put(
  "/:id",
  validate(updateFleetSchema),
  controller.updateFleet
);

// Delete fleet
router.delete("/:id", controller.deleteFleet);

module.exports = router;