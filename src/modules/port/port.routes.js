const express = require("express");
const authorize = require("../../middleware/authorize");
const validate = require("../../middleware/validate");
const controller = require("./port.controller");
const { createPortSchema, updatePortSchema } = require("./port.validation");

const router = express.Router();

router.get("/", authorize("ADMIN", "FLEET_MANAGER"), controller.getAllPorts);
router.get("/:id", authorize("ADMIN", "FLEET_MANAGER"), controller.getPortById);
router.post("/", authorize("ADMIN"), validate(createPortSchema), controller.createPort);
router.put("/:id", authorize("ADMIN"), validate(updatePortSchema), controller.updatePort);
router.delete("/:id", authorize("ADMIN"), controller.deletePort);

module.exports = router;
