const express = require("express");

const shipController = require("./ship.controller");
const validate = require("../../middleware/validate");
const authorize = require("../../middleware/authorize");
const { requireCompanyMembership } = require("../../middleware/companyScope");
const {
  createShipSchema,
  updateShipSchema,
} = require("./ship.validation");

const router = express.Router();

router.get("/", authorize("ADMIN", "FLEET_MANAGER"), requireCompanyMembership, shipController.getAllShips);
router.get("/company/:companyId", authorize("ADMIN", "FLEET_MANAGER"), requireCompanyMembership, shipController.getShipsByCompany);
router.get("/fleet/:fleetId", authorize("ADMIN", "FLEET_MANAGER"), requireCompanyMembership, shipController.getShipsByFleet);
router.get("/:id", authorize("ADMIN", "FLEET_MANAGER"), requireCompanyMembership, shipController.getShipById);

router.post("/", authorize("ADMIN", "FLEET_MANAGER"), requireCompanyMembership, validate(createShipSchema), shipController.createShip);
router.put("/:id", authorize("ADMIN", "FLEET_MANAGER"), requireCompanyMembership, validate(updateShipSchema), shipController.updateShip);
router.delete("/:id", authorize("ADMIN", "FLEET_MANAGER"), requireCompanyMembership, shipController.deleteShip);

module.exports = router;
