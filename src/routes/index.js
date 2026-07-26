const express = require("express");

const companyRoutes = require("../modules/company/company.routes");
const fleetRoutes = require("../modules/fleet/fleet.routes");
const shipRoutes = require("../modules/ship/ship.routes");
const portRoutes = require("../modules/port/port.routes");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Every Core resource belongs to a company, so all Core API calls require an
// access token issued by auth-service.
router.use(authenticate);

router.use("/companies", companyRoutes);
router.use("/fleets", fleetRoutes);
router.use("/ships", shipRoutes);
router.use("/ports", portRoutes);

module.exports = router;
