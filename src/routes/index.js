const express = require("express");

const companyRoutes = require("../modules/company/company.routes");

const router = express.Router();

router.use("/companies", companyRoutes);

module.exports = router;