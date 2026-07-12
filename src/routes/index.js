const express = require("express");

const companyRoutes = require("../modules/company/company.routes");
const fleetRoutes = require("../modules/fleet/fleet.routes");
const shipRoutes = require("../modules/ship/ship.routes");

const router = express.Router();

router.use("/companies", companyRoutes);
router.use("/fleets", fleetRoutes);
router.use("/ships", shipRoutes);

module.exports = router;
