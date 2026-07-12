const express = require("express");
const router = express.Router();

const companyController = require("./company.controller");
const validate = require("../../middleware/validate");

const {
  createCompanySchema,
  updateCompanySchema,
} = require("./company.validation");

router.get("/", companyController.getAllCompanies);

router.get("/:id", companyController.getCompanyById);

router.post(
  "/",
  validate(createCompanySchema),
  companyController.createCompany
);

router.put(
  "/:id",
  validate(updateCompanySchema),
  companyController.updateCompany
);

router.delete("/:id", companyController.deleteCompany);

module.exports = router;