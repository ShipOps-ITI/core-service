// The controller should only:
// receive the request,
// call the service,
// return a response.


const companyService = require("./company.service");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");

// GET /api/v1/companies
exports.getAllCompanies = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { companies, total } = await companyService.getAllCompanies({ skip, limit });

    return res.status(200).json({
      success: true,
      message: "Companies retrieved successfully",
      data: companies,
      pagination: getPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve companies",
    });
  }
};

// GET /api/v1/companies/:id
exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await companyService.getCompanyById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Company retrieved successfully",
      data: company,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve company",
    });
  }
};

// POST /api/v1/companies
exports.createCompany = async (req, res) => {
  try {
    const company = await companyService.createCompany(req.body);

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create company",
    });
  }
};

// PUT /api/v1/companies/:id
exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCompany = await companyService.getCompanyById(id);

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const updatedCompany = await companyService.updateCompany(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: updatedCompany,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to update company",
    });
  }
};

// DELETE /api/v1/companies/:id
exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const existingCompany = await companyService.getCompanyById(id);

    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    await companyService.deleteCompany(id);

    return res.status(200).json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete company",
    });
  }
};
