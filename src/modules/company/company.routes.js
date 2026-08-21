const express = require("express");
const router = express.Router();

const companyController = require("./company.controller");
const validate = require("../../middleware/validate");
const authorize = require("../../middleware/authorize");
const { requireCompanyMembership } = require("../../middleware/companyScope");

const {
  createCompanySchema,
  updateCompanySchema,
} = require("./company.validation");

router.get("/", requireCompanyMembership, companyController.getAllCompanies);

router.get("/:id", requireCompanyMembership, companyController.getCompanyById);

router.post(
  "/",
  authorize("ADMIN", "COMPANY_ADMIN"),
  validate(createCompanySchema),
  companyController.createCompany
);

router.put(
  "/:id",
  authorize("ADMIN", "COMPANY_ADMIN"),
  validate(updateCompanySchema),
  companyController.updateCompany
);

router.delete("/:id", authorize("ADMIN"), companyController.deleteCompany);

module.exports = router;
