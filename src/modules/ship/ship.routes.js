const express = require("express");

const shipController = require("./ship.controller");
const validate = require("../../middleware/validate");
const {
  createShipSchema,
  updateShipSchema,
} = require("./ship.validation");

const router = express.Router();

router.get("/", shipController.getAllShips);
router.get("/company/:companyId", shipController.getShipsByCompany);
router.get("/fleet/:fleetId", shipController.getShipsByFleet);
router.get("/:id", shipController.getShipById);

router.post("/", validate(createShipSchema), shipController.createShip);
router.put("/:id", validate(updateShipSchema), shipController.updateShip);
router.delete("/:id", shipController.deleteShip);

module.exports = router;
